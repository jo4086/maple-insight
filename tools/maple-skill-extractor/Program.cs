using System.Drawing.Imaging;
using System.Text.RegularExpressions;
using WzComparerR2.WzLib;

if (args.Length != 6 || args[0] != "--wz" || args[2] != "--output" ||
    (args[4] != "--job-id" && args[4] != "--job-ids"))
{
    Console.Error.WriteLine("Usage: maple-skill-extractor --wz <Base.wz|Skill.wz> --output <skills directory> --job-id <jobID>");
    Console.Error.WriteLine("   or: maple-skill-extractor --wz <Base.wz|Skill.wz> --output <skills directory> --job-ids <jobID,jobID,...>");
    return 2;
}

var wzPath = Path.GetFullPath(args[1]);
var outputRoot = Path.GetFullPath(args[3]);
if (!File.Exists(wzPath))
{
    Console.Error.WriteLine($"WZ file not found: {wzPath}");
    return 2;
}

var rawJobIds = args[5].Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
if (rawJobIds.Length == 0 || (args[4] == "--job-id" && rawJobIds.Length != 1) ||
    rawJobIds.Any(id => !Regex.IsMatch(id, @"^\d{1,5}$")))
{
    Console.Error.WriteLine("jobIDs must be numeric strings of 1–5 digits.");
    return 2;
}

var jobIds = rawJobIds
    .Select(id => id.TrimStart('0').PadLeft(3, '0'))
    .Distinct(StringComparer.Ordinal)
    .OrderBy(id => int.Parse(id))
    .ToArray();
var structure = new Wz_Structure();

try
{
    if (structure.IsKMST1125WzFormat(wzPath)) structure.LoadKMST1125DataWz(wzPath);
    else structure.Load(wzPath, Path.GetFileName(wzPath).Equals("Base.wz", StringComparison.OrdinalIgnoreCase));

    var created = 0;
    var reused = 0;
    var missing = 0;
    var failed = 0;
    var missingJobs = 0;
    foreach (var jobId in jobIds)
    {
        var imageNode = FindJobImage(structure.WzNode, jobId);
        if (imageNode is null)
        {
            missingJobs++;
            Console.Error.WriteLine($"MISSING_JOB jobID={jobId}: no skill IMG");
            continue;
        }

        var result = ExtractJob(imageNode, jobId, outputRoot);
        created += result.Created;
        reused += result.Reused;
        missing += result.Missing;
        failed += result.Failed;
        Console.WriteLine($"JOB jobID={jobId} skills={result.Skills} created={result.Created} reused={result.Reused} missing={result.Missing} failed={result.Failed}");
    }
    Console.WriteLine($"SUMMARY jobs={jobIds.Length} created={created} reused={reused} missing={missing} failed={failed} missingJobs={missingJobs}");
    return failed == 0 && missingJobs == 0 && created + reused > 0 ? 0 : 1;
}
catch (Exception error)
{
    Console.Error.WriteLine(error);
    return 1;
}
finally
{
    structure.Clear();
}

static (int Skills, int Created, int Reused, int Missing, int Failed) ExtractJob(
    Wz_Node imageNode, string jobId, string outputRoot)
{
    var image = imageNode.GetValue<Wz_Image>();
    if (image is null)
    {
        Console.Error.WriteLine($"FAILED_JOB jobID={jobId}: no image value");
        return (0, 0, 0, 0, 1);
    }
    if (!image.TryExtract(out var extractError))
    {
        Console.Error.WriteLine($"FAILED_JOB jobID={jobId}: {extractError?.Message}");
        return (0, 0, 0, 0, 1);
    }

    var skillNode = image.Node.Nodes["skill"];
    if (skillNode is null)
    {
        Console.Error.WriteLine($"FAILED_JOB jobID={jobId}: no skill node");
        return (0, 0, 0, 0, 1);
    }

    var iconNames = new[] { "icon", "iconMouseOver", "iconDisabled" };
    var skills = 0;
    var created = 0;
    var reused = 0;
    var missing = 0;
    var failed = 0;
    foreach (var skill in skillNode.Nodes)
    {
        if (!Regex.IsMatch(skill.Text, @"^\d+$")) continue;
        skills++;
        foreach (var iconName in iconNames)
        {
            var target = Path.Combine(outputRoot, jobId, skill.Text, $"{iconName}.png");
            if (IsPng(target))
            {
                reused++;
                continue;
            }

            var icon = ResolveUol(skill.Nodes[iconName]);
            var png = icon?.GetValue<Wz_Png>();
            if (png is null)
            {
                missing++;
                Console.WriteLine($"MISSING {jobId}/{skill.Text}/{iconName}");
                continue;
            }

            try
            {
                Directory.CreateDirectory(Path.GetDirectoryName(target)!);
                var temporary = target + ".tmp";
                using (var bitmap = png.ExtractPng()) bitmap.Save(temporary, ImageFormat.Png);
                File.Move(temporary, target, true);
                created++;
            }
            catch (Exception error)
            {
                failed++;
                Console.Error.WriteLine($"FAILED {jobId}/{skill.Text}/{iconName}: {error.Message}");
            }
        }
    }
    return (skills, created, reused, missing, failed);
}

static Wz_Node? FindJobImage(Wz_Node root, string jobId)
{
    var pending = new Stack<Wz_Node>();
    pending.Push(root);
    while (pending.Count > 0)
    {
        var current = pending.Pop();
        if (current.Text.EndsWith(".img", StringComparison.OrdinalIgnoreCase) &&
            current.Text[..^4].TrimStart('0') == jobId.TrimStart('0') &&
            current.GetValue<Wz_Image>() is not null)
            return current;
        foreach (var child in current.Nodes) pending.Push(child);
    }
    return null;
}

static Wz_Node? ResolveUol(Wz_Node? node)
{
    for (var depth = 0; node is not null && depth < 16; depth++)
    {
        if (node.Value is not Wz_Uol uol) return node;
        node = uol.HandleUol(node);
    }
    return null;
}

static bool IsPng(string path)
{
    if (!File.Exists(path)) return false;
    using var file = File.OpenRead(path);
    Span<byte> header = stackalloc byte[8];
    return file.Read(header) == header.Length &&
           header.SequenceEqual(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 });
}
