/**
 * 农历转换工具 - 支持 1900-2100 年
 */
(function () {
  'use strict';

  // 农历数据表 1900-2100
  var lunarInfo = [
    0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
    0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
    0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
    0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
    0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
    0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,
    0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
    0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,
    0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
    0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x05ac0,0x0ab60,0x096d5,0x092e0,
    0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
    0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
    0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
    0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
    0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,
    0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae0,
    0x092e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,
    0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,
    0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,
    0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a4d0,0x0d150,0x0f252,
    0x0d520
  ];

  var Gan = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  var Zhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  var nStr1 = ['日','一','二','三','四','五','六','七','八','九','十'];
  var nStr2 = ['初','十','廿','卅'];
  var monthNames = ['正','二','三','四','五','六','七','八','九','十','冬','腊'];

  function lYearDays(y) {
    var i, sum = 348;
    for (i = 0x8000; i > 0x8; i >>= 1) {
      sum += (lunarInfo[y - 1900] & i) ? 1 : 0;
    }
    return sum + leapDays(y);
  }

  function leapMonth(y) {
    return lunarInfo[y - 1900] & 0xf;
  }

  function leapDays(y) {
    if (leapMonth(y)) {
      return (lunarInfo[y - 1900] & 0x10000) ? 30 : 29;
    }
    return 0;
  }

  function monthDays(y, m) {
    if (m > 12 || m < 1) return -1;
    return (lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29;
  }

  function solar2lunar(y, m, d) {
    if (y < 1900 || y > 2100) return null;
    if (y === 1900 && m === 1 && d < 31) return null;

    var offset = 0;
    var baseDate = new Date(1900, 0, 31);
    var objDate = new Date(y, m - 1, d);
    offset = Math.floor((objDate - baseDate) / 86400000);

    var i, temp = 0;
    for (i = 1900; i < 2101 && offset > 0; i++) {
      temp = lYearDays(i);
      offset -= temp;
    }
    if (offset < 0) {
      offset += temp;
      i--;
    }

    var year = i;
    var leap = leapMonth(i);
    var isLeap = false;

    for (i = 1; i < 13 && offset > 0; i++) {
      if (leap > 0 && i === (leap + 1) && !isLeap) {
        --i;
        isLeap = true;
        temp = leapDays(year);
      } else {
        temp = monthDays(year, i);
      }
      if (isLeap && i === (leap + 1)) {
        isLeap = false;
      }
      offset -= temp;
    }

    if (offset === 0 && leap > 0 && i === leap + 1) {
      if (isLeap) {
        isLeap = false;
      } else {
        isLeap = true;
        --i;
      }
    }
    if (offset < 0) {
      offset += temp;
      --i;
    }

    var month = i;
    var day = offset + 1;

    // Format
    var monthStr = (isLeap ? '闰' : '') + monthNames[month - 1] + '月';
    var dayStr;
    if (day <= 10) {
      dayStr = nStr2[0] + nStr1[day];
    } else if (day > 10 && day < 20) {
      dayStr = nStr2[1] + nStr1[day - 10];
    } else if (day === 20) {
      dayStr = '二十';
    } else if (day > 20 && day < 30) {
      dayStr = nStr2[2] + nStr1[day - 20];
    } else if (day === 30) {
      dayStr = '三十';
    }

    var ganZhiYear = Gan[(year - 4) % 10] + Zhi[(year - 4) % 12] + '年';

    return {
      lYear: year,
      lMonth: month,
      lDay: day,
      isLeap: isLeap,
      monthStr: monthStr,
      dayStr: dayStr,
      ganZhiYear: ganZhiYear,
      fullStr: ganZhiYear + monthStr + dayStr
    };
  }

  /**
   * 将公历日期字符串转为农历字符串
   * @param {string} dateStr - 格式 "YYYY-MM-DD"
   * @returns {string} 农历字符串，如 "甲辰年正月初一"
   */
  function toLunar(dateStr) {
    if (!dateStr) return '';
    var parts = dateStr.substring(0, 10).split('-');
    var y = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    var d = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return '';
    var result = solar2lunar(y, m, d);
    return result ? result.fullStr : '';
  }

  window.Lunar = {
    toLunar: toLunar,
    solar2lunar: solar2lunar
  };
})();
