#!/bin/bash

echo "🔍 Production Debugging for Radja Auto Car..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_PATH=$(pwd)
echo "Project path: $PROJECT_PATH"

echo -e "\n${YELLOW}1. Checking Next.js build status...${NC}"
if [ -d ".next" ]; then
    echo -e "${GREEN}✅ .next directory exists${NC}"
    ls -la .next/server/app/api/ 2>/dev/null || echo -e "${RED}❌ API routes not found in build${NC}"
else
    echo -e "${RED}❌ .next directory not found - app not built${NC}"
fi

echo -e "\n${YELLOW}2. Testing API endpoint directly...${NC}"
API_TEST=$(curl -s -o /tmp/api_test.txt -w "%{http_code}" http://localhost:3000/api/mobil)
echo "HTTP Status: $API_TEST"

if [ "$API_TEST" = "200" ]; then
    echo -e "${GREEN}✅ API responding with 200${NC}"
    echo "Response:"
    cat /tmp/api_test.txt | jq . 2>/dev/null || cat /tmp/api_test.txt
else
    echo -e "${RED}❌ API not responding correctly${NC}"
    echo "Response content:"
    cat /tmp/api_test.txt | head -20
fi

echo -e "\n${YELLOW}3. Checking PM2 status and logs...${NC}"
pm2 status
echo -e "\n${YELLOW}Recent logs:${NC}"
pm2 logs radja-auto-car --lines 30 --nostream

echo -e "\n${YELLOW}4. Checking file structure...${NC}"
echo "API route files:"
find . -name "route.ts" -path "*/api/*" 2>/dev/null

echo -e "\n${YELLOW}5. Testing with curl POST...${NC}"
curl -X POST http://localhost:3000/api/mobil \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' \
  -w "\nHTTP Status: %{http_code}\nContent-Type: %{content_type}\n" \
  -v 2>&1 | grep -E "(HTTP|Content-Type|Connected|<)"

echo -e "\n${YELLOW}6. Checking environment...${NC}"
echo "NODE_ENV: ${NODE_ENV:-not set}"
echo "Port: ${PORT:-not set}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
    grep -c "MONGODB_URI" .env > /dev/null && echo "✅ MONGODB_URI set" || echo "❌ MONGODB_URI missing"
    grep -c "NEXTAUTH_SECRET" .env > /dev/null && echo "✅ NEXTAUTH_SECRET set" || echo "❌ NEXTAUTH_SECRET missing"
else
    echo -e "${RED}❌ .env file not found${NC}"
fi

echo -e "\n${YELLOW}7. Checking uploads directory...${NC}"
if [ -d "public/uploads" ]; then
    echo -e "${GREEN}✅ uploads directory exists${NC}"
    ls -la public/uploads/ | head -5
    echo "Total files: $(find public/uploads/ -type f 2>/dev/null | wc -l)"
else
    echo -e "${RED}❌ uploads directory missing${NC}"
    echo "Creating uploads directory..."
    mkdir -p public/uploads
    chmod 755 public/uploads
fi

echo -e "\n${YELLOW}8. Memory and disk usage...${NC}"
free -h | grep -E "Mem:|Swap:"
df -h | grep -E "Filesystem|/dev/" | head -3

echo -e "\n${YELLOW}9. Network and ports...${NC}"
netstat -tulpn | grep :3000 || echo "Port 3000 not listening"

echo -e "\n${YELLOW}10. Testing MongoDB connection...${NC}"
node -e "
const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || 'not set';
console.log('MongoDB URI configured:', uri !== 'not set' ? 'Yes' : 'No');
if (uri !== 'not set') {
  mongoose.connect(uri).then(() => {
    console.log('✅ MongoDB connection successful');
    process.exit(0);
  }).catch(err => {
    console.log('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
} else {
  console.log('❌ MONGODB_URI not configured');
  process.exit(1);
}
" 2>/dev/null || echo "❌ MongoDB test failed"

rm -f /tmp/api_test.txt

echo -e "\n${GREEN}Debug completed. Check the output above for issues.${NC}"
