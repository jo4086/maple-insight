import {
  classTree,
  resolveClassNameGroups,
  type Affiliation,
  type AllClassName,
  type ClassGroup,
  type Lineage,
} from '@maple/data-core';
import {
  affiliationCodeMap,
  classGroupCodeMap,
  defaultClassLevelSequence,
  dualBladeClassLevelSequence,
} from '@maple/internal';

import type {
  ClassLevel,
  GeneratedClass,
  InternalClassGroup,
} from './types';

type ClassTreeNode = (typeof classTree)[number]['roots'][number];

const placeholderRootNames = new Set<AllClassName>(['초보자', '노블레스', '시티즌']);
const defaultLinearSequence = defaultClassLevelSequence;
const defaultBranchSequence = [2, 3, 4, 'hyper', 5, 6] as const;

function padTwoDigit(value: number): string {
  return value.toString().padStart(2, '0');
}

function getClassGroups(className: AllClassName): ClassGroup[] {
  return [...resolveClassNameGroups(className)];
}

function getPrimaryClassGroup(className: AllClassName): ClassGroup | null {
  return getClassGroups(className)[0] ?? null;
}

function getClassLineage(affiliation: Affiliation, className: AllClassName): Lineage {
  if (className === '데몬슬레이어' || className === '데몬어벤져') {
    return '데몬';
  }

  return affiliation;
}

function createGeneratedClass(
  affiliation: Affiliation,
  className: AllClassName,
  classGroup: InternalClassGroup[],
  classLevel: ClassLevel,
  suffix: string,
): GeneratedClass {
  const affiliationCode = affiliationCodeMap[affiliation];
  const primaryClassGroup = classGroup[0];

  if (!primaryClassGroup) {
    throw new Error(`class group is required for ${className}`);
  }

  const classGroupCode = classGroupCodeMap[primaryClassGroup];

  return {
    classId: `${affiliationCode}${classGroupCode}${suffix}`,
    className,
    affiliation,
    lineage: getClassLineage(affiliation, className),
    classGroup,
    classLevel,
  };
}

function appendRepeatedLeafClasses(
  classes: GeneratedClass[],
  affiliation: Affiliation,
  className: AllClassName,
  classGroup: ClassGroup[],
  lineIndex: number,
  sequence: readonly ClassLevel[],
): void {
  sequence.forEach((classLevel, sequenceIndex) => {
    classes.push(
      createGeneratedClass(
        affiliation,
        className,
        classGroup,
        classLevel,
        `${lineIndex}${sequenceIndex}`,
      ),
    );
  });
}

function traverseBranchChain(
  node: ClassTreeNode,
  classes: GeneratedClass[],
  affiliation: Affiliation,
  classGroup: ClassGroup[],
  lineIndex: number,
): void {
  const sequence =
    node.className === '세미듀어러' ? dualBladeClassLevelSequence : defaultBranchSequence;

  const chain: AllClassName[] = [];
  let currentNode: ClassTreeNode | undefined = node;

  while (currentNode) {
    chain.push(currentNode.className);
    currentNode = currentNode.children?.[0];
  }

  chain.forEach((className, sequenceIndex) => {
    if (sequenceIndex >= sequence.length) {
      return;
    }

    classes.push(
      createGeneratedClass(
        affiliation,
        className,
        classGroup,
        sequence[sequenceIndex],
        `${lineIndex}${sequenceIndex}`,
      ),
    );
  });

  const finalClassName = chain[chain.length - 1];

  if (!finalClassName) {
    return;
  }

  sequence.slice(chain.length).forEach((classLevel, extraIndex) => {
    const sequenceIndex = chain.length + extraIndex;

    classes.push(
      createGeneratedClass(
        affiliation,
        finalClassName,
        classGroup,
        classLevel,
        `${lineIndex}${sequenceIndex}`,
      ),
    );
  });
}

function processBranchRoot(
  affiliation: Affiliation,
  node: ClassTreeNode,
  classes: GeneratedClass[],
  includeRootClass: boolean,
): void {
  const classGroup = getClassGroups(node.className);

  if (classGroup.length === 0) {
    return;
  }

  if (includeRootClass) {
    classes.push(createGeneratedClass(affiliation, node.className, classGroup, 1, '00'));
  }

  node.children?.forEach((branchNode, branchIndex) => {
    traverseBranchChain(branchNode, classes, affiliation, classGroup, branchIndex + 1);
  });
}

function processPlaceholderRoot(
  affiliation: Affiliation,
  root: ClassTreeNode,
  rootIndex: number,
  classes: GeneratedClass[],
  lineIndexByGroup: Map<ClassGroup, number>,
): void {
  classes.push(
    createGeneratedClass(
      affiliation,
      root.className,
      ['미전직'],
      0,
      padTwoDigit(rootIndex),
    ),
  );

  root.children?.forEach((childNode) => {
    const classGroup = getClassGroups(childNode.className);
    const primaryClassGroup = classGroup[0];

    if (!primaryClassGroup) {
      return;
    }

    const currentLineIndex = lineIndexByGroup.get(primaryClassGroup) ?? 0;

    if (childNode.children && childNode.children.length > 0 && !placeholderRootNames.has(childNode.className)) {
      if (
        childNode.children.length === 1 &&
        childNode.children[0] &&
        getPrimaryClassGroup(childNode.children[0].className) === primaryClassGroup
      ) {
        appendRepeatedLeafClasses(
          classes,
          affiliation,
          childNode.className,
          classGroup,
          currentLineIndex,
          defaultLinearSequence,
        );
        lineIndexByGroup.set(primaryClassGroup, currentLineIndex + 1);
        return;
      }

      if (childNode.className === '로그') {
        classes.push(
          createGeneratedClass(
            affiliation,
            childNode.className,
            classGroup,
            1,
            `${currentLineIndex}0`,
          ),
        );
        lineIndexByGroup.set(primaryClassGroup, currentLineIndex + 1);
      } else {
        lineIndexByGroup.set(primaryClassGroup, currentLineIndex + 1);
      }

      processBranchRoot(affiliation, childNode, classes, childNode.className !== '로그');
      return;
    }

    appendRepeatedLeafClasses(
      classes,
      affiliation,
      childNode.className,
      classGroup,
      currentLineIndex,
      defaultLinearSequence,
    );
    lineIndexByGroup.set(primaryClassGroup, currentLineIndex + 1);
  });
}

function processSpecialRoot(
  affiliation: Affiliation,
  root: ClassTreeNode,
  rootIndex: number,
  classes: GeneratedClass[],
  lineIndexByGroup: Map<ClassGroup, number>,
): void {
  classes.push(
    createGeneratedClass(
      affiliation,
      root.className,
      ['미전직'],
      0,
      padTwoDigit(rootIndex),
    ),
  );

  const classGroup = getClassGroups(root.className);
  const primaryClassGroup = classGroup[0];

  if (!primaryClassGroup) {
    return;
  }

  const currentLineIndex = lineIndexByGroup.get(primaryClassGroup) ?? 0;

  appendRepeatedLeafClasses(
    classes,
    affiliation,
    root.className,
    classGroup,
    currentLineIndex,
    defaultLinearSequence,
  );
  lineIndexByGroup.set(primaryClassGroup, currentLineIndex + 1);
}

export function createGeneratedClasses(): GeneratedClass[] {
  const classes: GeneratedClass[] = [];

  classTree.forEach(({ affiliation, roots }) => {
    const lineIndexByGroup = new Map<ClassGroup, number>();

    roots.forEach((root, rootIndex) => {
      if (placeholderRootNames.has(root.className)) {
        processPlaceholderRoot(
          affiliation,
          root,
          rootIndex,
          classes,
          lineIndexByGroup,
        );
        return;
      }

      processSpecialRoot(affiliation, root, rootIndex, classes, lineIndexByGroup);
    });
  });

  return classes;
}
