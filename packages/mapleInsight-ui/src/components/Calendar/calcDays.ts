import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/ko';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('ko');

// korea current date
const todayKR = dayjs().tz('Asia/Seoul');

// current month first day
const startDay = todayKR.startOf('month').day();

// create days next month day prev
const dayInMonth = todayKR.daysInMonth();
// todayKR.month()
const daysArray = Array.from({ length: dayInMonth }, (_, i) => todayKR.date(i + 1).format('YYYY-MM-DD'));
console.log(todayKR.hour(), '시', todayKR.minute(), '분', `${todayKR.second()}.${todayKR.millisecond()}`, '초');

// function monthFormat () {

// }

console.log(todayKR.month() + 1);
console.log(daysArray);
