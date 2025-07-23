// scripts/test-api.js - API Endpoint Tester
const https = require("https");
const http = require("http");

class APITester {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async makeRequest(path, method = "GET", data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const isHTTPS = url.protocol === "https:";
      const client = isHTTPS ? https : http;

      const options = {
        hostname: url.hostname,
        port: url.port || (isHTTPS ? 443 : 80),
        path: url.pathname + url.search,
        method: method,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "API-Tester/1.0",
        },
      };

      const req = client.request(options, (res) => {
        let responseData = "";

        res.on("data", (chunk) => {
          responseData += chunk;
        });

        res.on("end", () => {
          try {
            const parsedData = JSON.parse(responseData);
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: parsedData,
              raw: responseData,
            });
          } catch (parseError) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: null,
              raw: responseData,
              parseError: parseError.message,
            });
          }
        });
      });

      req.on("error", (error) => {
        reject({
          error: error.message,
          code: error.code,
        });
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  async testEndpoint(path, method = "GET", data = null) {
    console.log(`\n🧪 Testing ${method} ${path}`);
    console.log("─".repeat(50));

    try {
      const startTime = Date.now();
      const response = await this.makeRequest(path, method, data);
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`📊 Status: ${response.status}`);
      console.log(`⏱️ Response Time: ${duration}ms`);
      console.log(
        `📄 Content-Type: ${
          response.headers["content-type"] || "Not specified"
        }`
      );

      if (response.parseError) {
        console.log(`❌ Parse Error: ${response.parseError}`);
        console.log(
          `📝 Raw Response (first 200 chars): ${response.raw.substring(
            0,
            200
          )}...`
        );
      } else if (response.data) {
        console.log(`✅ Valid JSON Response`);
        console.log(
          `📋 Response Keys: ${Object.keys(response.data).join(", ")}`
        );

        if (response.data.success !== undefined) {
          console.log(`🎯 Success: ${response.data.success}`);
        }

        if (response.data.message) {
          console.log(`💬 Message: ${response.data.message}`);
        }

        if (response.data.error) {
          console.log(`❌ Error: ${response.data.error}`);
        }
      }

      return response;
    } catch (error) {
      console.log(`❌ Request Failed: ${error.error || error.message}`);
      console.log(`🔧 Error Code: ${error.code || "Unknown"}`);
      return null;
    }
  }
}

async function runTests() {
  console.log("🚀 API Endpoint Testing Suite");
  console.log("============================");

  // Get base URL from command line arguments or use default
  const baseUrl = process.argv[2] || "http://localhost:3000";
  console.log(`🌐 Base URL: ${baseUrl}`);

  const tester = new APITester(baseUrl);

  // Test endpoints
  const endpoints = [
    { path: "/api/health", method: "GET", description: "Health Check" },
    { path: "/api/mobil", method: "GET", description: "Mobil API Status" },
    { path: "/api/route", method: "GET", description: "Basic API Route" },
  ];

  let passedTests = 0;
  let totalTests = endpoints.length;

  for (const endpoint of endpoints) {
    console.log(`\n📋 ${endpoint.description}`);
    const response = await tester.testEndpoint(endpoint.path, endpoint.method);

    if (response && response.status < 400) {
      passedTests++;
      console.log("✅ Test Passed");
    } else {
      console.log("❌ Test Failed");
    }
  }

  // Summary
  console.log("\n📊 Test Summary");
  console.log("===============");
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(
    `📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`
  );

  if (passedTests === totalTests) {
    console.log("\n🎉 All tests passed! API is working correctly.");
    process.exit(0);
  } else {
    console.log("\n⚠️ Some tests failed. Check the logs above for details.");
    process.exit(1);
  }
}

// Run the tests
runTests().catch((error) => {
  console.error("🔥 Test suite failed:", error);
  process.exit(1);
});
