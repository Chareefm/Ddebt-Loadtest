import http from 'k6/http';
import { SharedArray } from 'k6/data';
import { check, sleep } from 'k6';

export const options = {
  insecureSkipTLSVerify: true,
  stages: [
    { duration: '5m', target: 2 },
    { duration: '20m', target: 3 },
    { duration: '5m', target: 0 },
  ],
//   // vus: 1, //700-1200
//   // duration: '30s',//1hr
};

export default function () {

  //Report
  const exportUrl = 'https://ddebtuat.gsb.or.th/public/api/report/api/reports?isExport=true&report=debt-collection-information-assigned-by-bank';
  const exportPayloads = JSON.stringify({
    'isExport': 'true',
    'report': 'debt-collection-information-assigned-by-bank'
    });
  const exportResult = http.get(exportUrl,exportPayloads);
  check(exportResult, { 'ReportExport status was 200': (exportResult) => exportResult.status === 200 });
  const exportreport = JSON.parse(exportResult.body);
  console.log(exportreport);
  sleep(3);
  console.log("End"); 
}

