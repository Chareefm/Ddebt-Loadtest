import http from 'k6/http';
import { SharedArray } from 'k6/data';
import { check, sleep } from 'k6';

export const options = {
  insecureSkipTLSVerify: true,
  // stages: [
  //   { duration: '5m', target: 40 },
  //   { duration: '50m', target: 40 },
  //   { duration: '5m', target: 0 },
  // ],
  vus: 60, //700-1200
  duration: '5m',//1hr
};

export function gettime() {
    return Date.now()
}

const data = new SharedArray('users', function () {
  const f = JSON.parse(open('../oa_data.json'));
  return f; 
});

const searchData = new SharedArray('search', function () {
   const s = JSON.parse(open('../search_data.json'));
   return s;
});

const wrapupData = new SharedArray('wrapup', function () {
   const r = JSON.parse(open('../wrapup_data.json'));
   return r;
});

let token;
var refreshed = 0;

export default function () {
  // console.log(refreshed,Math.floor(gettime()/1000));
  
  if(refreshed < Math.floor(gettime()/1000) || refreshed == Math.floor(gettime()/1000)){
    // console.log("refreshed Token");
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
    const jsoncode = JSON.parse(authResult.body);
    const code = jsoncode.code;
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
     const jsontoken = JSON.parse(tokenResult.body);
     token = 'Bearer '+jsontoken.access_token;
    //  console.log(`${user.username}, ${user.password}`);
    // console.log(token);
    // console.log("Time!!!!!!");
    refreshed = Math.floor(gettime()/1000 + 60)
  }
  // console.log("Out!!!!!!");
  sleep(3);   
  
  //DebtSearch
  const search = searchData[Math.floor(Math.random() * searchData.length)];
  // console.log(search);
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
  check(debtSearchResult, { 'Search was 200': (debtSearchResult) => debtSearchResult.status === 201 });
  const debtsearch = JSON.parse(debtSearchResult.body);
  console.log(debtsearch);
  sleep(3);  


  //SaveAction
  const wrapup = wrapupData[Math.floor(Math.random() * wrapupData.length)];
  // console.log(`${wrapup.contact},${wrapup.actionCodeName},${wrapup.statusCodeName},${wrapup.accountNo}`);

  const saveUrl = 'https://ddebt.gsb.or.th/public/api/debt/wrapup/save';
  const savePayloads = JSON.stringify({
    "data": {
        "contact": `${wrapup.contact}`,
        "phone": "0888888888",
        "actionCodeId": "Contact",
        "actionCodeName":`${wrapup.actionCodeName}`,
        "statusCodeId": `${wrapup.statusCodeId}`,
        "statusCodeName": `${wrapup.statusCodeName}`,
        "accountNo": `${wrapup.accountNo}`,
        "paymentDate": null,
        "paymentAmt": 0,
        "appointmentDate": null,
        "measure": "",
        "remark": "-",
        "cif": `${wrapup.cif}`,
        "userId": `${wrapup.userId}`,
        "collName": `${wrapup.collName}`,
        "updatedDate": "2022-09-30T04:35:56.719Z"
    }
    });
  const saveHeaders = {
    headers: {
      'authorization': token,
      'Content-Type': 'application/json',
    },
  };
  const saveResult = http.post(saveUrl, savePayloads, saveHeaders);
  check(saveResult, { 'Wrap up was 200': (saveResult) => saveResult.status == 201 });
  const save = JSON.parse(saveResult.body);
  console.log(save);
  sleep(3);  
  // console.log("End");

}

