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
  const reportdUrl = 'https://ddebtuat.gsb.or.th/public/api/report/api/reports?isExport=false&report=debt-collection-information-assigned-by-bank';
  const reportPayloads = JSON.stringify({
    'isExport': 'false',
    'report': 'debt-collection-information-assigned-by-bank'
    });
  const reportResult = http.get(reportdUrl,reportPayloads);
  check(reportResult, { 'Report status was 200': (reportResult) => reportResult.status === 200 });
  const report = JSON.parse(reportResult.body);
  console.log(report);
  sleep(3);
  console.log("End"); 
}

