import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  insecureSkipTLSVerify: true,
  // stages: [
  //   { duration: '30s', target: 20 },
  //   { duration: '40s', target: 10 },
  //   { duration: '20s', target: 0 },
  // ],
//   vus: 1, //700-1200
//   duration: '180s',//1hr
};

export function gettime() {
    return Date.now()
}

let token;
var refreshed = 0;

export default function () {
  // console.log(refreshed,Math.floor(gettime()/1000));
  if(refreshed < Math.floor(gettime()/1000) || refreshed == Math.floor(gettime()/1000)){
    // console.log("refreshed Token");
    // auth
    const authUrl = 'https://user.ddebt.gsb.or.th/auth/authorize';
    const authPayloads = JSON.stringify({
      "clientId": "3f891e74-131d-49d7-8d3a-d52c6c0119eb",
      "redirectUrl": "https://ddebt.gsb.or.th/",
      "codeVerifier": "NBl128w7cMOukaE2DCk/w5MljhLqDLtZpt6++FXpcc4=",
      "credential": {
          "username": "thana",
          "password": "P@ssw0rd"
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
      "status was 200": (authResult) => authResult.status === 200
    });
    const jsoncode = JSON.parse(authResult.body);
    const code = jsoncode.code;
    // console.log(code);

    //Token
    const tokenUrl = 'https://user.ddebt.gsb.or.th/auth/token';
    const tokenPayloads = JSON.stringify({
      "clientId": "3f891e74-131d-49d7-8d3a-d52c6c0119eb",
      "code": code,
      "challenge": "e6d3059b-9c66-474f-831b-b26c182deaa5"
      });

    const tokenResult = http.post(tokenUrl, tokenPayloads, Headers);
    check(tokenResult, {
      "status was 200": (tokenResult) => tokenResult.status === 200
      });
    const jsontoken = JSON.parse(tokenResult.body);
    token = 'Bearer '+jsontoken.access_token;
    // console.log(token); 
    // console.log("Time!!!!!!");
    refreshed = Math.floor(gettime()/1000 + 60)
  }
  // console.log("Out!!!!!!");
  // sleep(5)  
  
  //LeadSearch
  const leadSearchUrl = 'https://ddebt.gsb.or.th/public/api/debt/search/lead';
  const leadSearchPayloads = JSON.stringify({
        "skip": 0,
        "take": 10,
        "collector": 288,
        "actionCode": "contact"
    });
  const leadSearchHeaders = {
    headers: {
      'authorization': token,
      'Content-Type': 'application/json',
    },
  };
  const leadearchResult = http.post(leadSearchUrl,leadSearchPayloads,leadSearchHeaders);
  check(leadearchResult, {
      "Search was 200": (leadearchResult) => leadearchResult.status === 201,
    });
  // console.log(leadearchResult);
  // sleep(5) 

  //setCollector
  const setCollectorUrl = 'https://ddebt.gsb.or.th/public/api/debt/debtor/setCollector';
  const setCollectorPayloads = JSON.stringify({
    "condition":{"id":{"in":[57925,58976,63338,57870,59450,59624,59450,57700,58624,58988,64922,62882,57691,62820,58101,61574,63961,59645,57950,58134,58483,58128,58298,59030,62356,63402,64477,62080,58540,63389,57953,59445,58479,59213,62878,57772,59256,59208,59165,59459,59444, 58914,58117,59738,58045,62918,57954,58201,58955,58791,58864,8303,63279,57768,58535,62317,59465,61552,58889,59168,58974]}},"adminOaId":287
});
  const setCollectorHeaders = {
    headers: {
      'authorization': token,
      'Content-Type': 'application/json',
    },
  };
  const setCollectorResult = http.post(setCollectorUrl,setCollectorPayloads,setCollectorHeaders);
  check(setCollectorResult, {
      "Lead was 200": (setCollectorResult) => setCollectorResult.status === 201,
    });
  // console.log(setCollectorResult);
  // sleep(5) 
  // console.log("End");
  
}