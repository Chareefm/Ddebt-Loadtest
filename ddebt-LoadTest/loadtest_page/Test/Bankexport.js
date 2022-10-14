import http from 'k6/http';
import { SharedArray } from 'k6/data';
import { check, sleep } from 'k6';

export const options = {
  insecureSkipTLSVerify: true,
  // stages: [
  //   { duration: '5m', target: 2 },
  //   { duration: '20m', target: 3 },
  //   { duration: '5m', target: 0 },
  // ],
  vus: 4, //700-1200
  duration: '5m',//1hr
};

export function gettime() {
    return Date.now()
}

const data = new SharedArray('users', function () {
  const f = JSON.parse(open('../bank_data.json'));
  return f; 
});

const searchData = new SharedArray('search', function () {
   const s = JSON.parse(open('../search_dataBank.json'));
   return s;
});

let token;
var refreshed = 0;

export default function () {
  console.log(refreshed,Math.floor(gettime()/1000));
  if(refreshed < Math.floor(gettime()/1000) || refreshed == Math.floor(gettime()/1000)){
    console.log("refreshed Token");
    //auth
    const user = data[Math.floor(Math.random() * data.length)];
    const authUrl = 'https://user.ddebt.gsb.or.th/auth/authorize';
    const authPayloads = JSON.stringify({
      "clientId": "3f891e74-131d-49d7-8d3a-d52c6c0119eb",
      "redirectUrl": "https://ddebt.gsb.or.th/",
      "codeVerifier": "SDAXZTGCbRGzadkp42cevNqg4qSW6F1CUTrbmvHRvuk=",
      "credential": {
          "username": `${user.username}`,
          "password": `${user.password}`
      },
      "rememberMe": true
      });

    const Headers = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const authResult = http.post(authUrl, authPayloads, Headers);
    check(authResult, {
        "Auth status was 200": (authResult) => authResult.status == 200,
    });
    const code =  authResult.json().code;
    console.log(code);
   
    //Token
    const tokenUrl = 'https://user.ddebt.gsb.or.th/auth/token';
    const tokenPayloads = JSON.stringify({
      "clientId": "3f891e74-131d-49d7-8d3a-d52c6c0119eb",
      "code": code,
      "challenge": "81675d09-ce3f-416e-bf79-3ae506d84c78"
      });

    const tokenResult = http.post(tokenUrl, tokenPayloads, Headers);
    check(tokenResult, {
        "Token status was 200": (tokenResult) => tokenResult.status == 200,
      });
     token = 'Bearer '+tokenResult.json().access_token;
     console.log(`${user.username}, ${user.password}`);
    // console.log(token);
    console.log("Time!!!!!!");
    refreshed = Math.floor(gettime()/1000 + 60)
  }
  console.log("Out!!!!!!");
  sleep(3);   

  //Dashboard
  const dashboardUrl = 'https://ddebt.gsb.or.th/public/api/debt/debtor/dashboardBankAuth';
  const dashboardHeaders = {
    headers: {
      'authorization': token,
    },
  };
  const dashboardResult = http.get(dashboardUrl,dashboardHeaders);
  check(dashboardResult, { 'Dashboard status was 200': (dashboardResult) => dashboardResult.status === 200 });
  const dashboard = JSON.parse(dashboardResult.body);
  // console.log(dashboardResult); 

  
  //DebtSearch
  const search = searchData[Math.floor(Math.random() * searchData.length)];
   console.log(search);
  const debtSearchUrl = 'https://ddebt.gsb.or.th/public/api/debt/search/debtSearch';
  const debtSearchPayloads = JSON.stringify(
    search
  );
  const debtSearchHeaders = {
    headers: {
      'authorization': token,
      'Content-Type': 'application/json',
    },
  };
  const debtSearchResult = http.post(debtSearchUrl,debtSearchPayloads,debtSearchHeaders);
  check(debtSearchResult, { 'Search status was 200': (debtSearchResult) => debtSearchResult.status === 201 });
  const debtsearch = JSON.parse(debtSearchResult.body);
  console.log(debtsearch);
  sleep(3);    

  //Export CSV
  const exportdUrl = 'https://ddebt.gsb.or.th/public/api/debt/search/debtorExport';
  const exportPayloads = JSON.stringify({
    "loanType": "Card Link",
    "accountStatus": "W/O"
      // "cif": `${search.cif}`,
      // "accountNo": `${search.accountNo}`,
      // "custName": `${search.custName}`,
      // "loanType": `${search.loanType}`,
      // "statusDebt": "action",
      // "accountStatus": `${search.accountStatus}`
    });
  const exportHeaders = {
    headers: {
      'authorization': token,
      'Content-Type': 'application/json',
    },
  };
  const exportResult = http.post(exportdUrl, exportPayloads, exportHeaders);
  check(exportResult, { 'Export status was 200': (exportResult) => exportResult.status == 201 });
  const exportcsv = JSON.parse(exportResult.body);
  console.log(exportcsv);
  sleep(3);   
  console.log("End");
}

