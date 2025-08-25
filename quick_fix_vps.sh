#!/bin/bash
# quick_fix_vps.sh - Perbaikan cepat untuk masalah VPS

echo "🔧 QUICK FIX VPS ISSUES"
echo "======================="

# 1. Install jq untuk JSON parsing
echo "📦 Installing jq..."
apt update && apt install -y jq

# 2. Check current directory structure
echo -e "\n📁 Current directory structure:"
pwd
ls -la public/uploads/ | head -10

echo -e "\n📸 Photo files count:"
find public/uploads -name "*.jpg" -o -name "*.png" -o -name "*.jpeg" | wc -l

# 3. Test API endpoints
echo -e "\n🔗 Testing API endpoints:"

echo "Testing /api/mobil..."
curl -s http://localhost:3000/api/mobil | jq -r '.success // "API Error"'

echo -e "\nTesting /api/uploads with actual file..."
SAMPLE_FILE=$(ls public/uploads/*.jpg | head -1 | basename)
echo "Sample file: $SAMPLE_FILE"

if [ ! -z "$SAMPLE_FILE" ]; then
    echo "Testing: /api/uploads/$SAMPLE_FILE"
    curl -I http://localhost:3000/api/uploads/$SAMPLE_FILE
else
    echo "No sample file found"
fi

# 4. Check file permissions
echo -e "\n🔒 Checking file permissions:"
ls -la public/uploads/ | head -5

# 5. Fix permissions if needed
echo -e "\n🔧 Fixing permissions..."
chmod 755 public/uploads/
chmod 644 public/uploads/*

# 6. Test direct file access
echo -e "\n📄 Testing direct file access:"
if [ ! -z "$SAMPLE_FILE" ]; then
    echo "File exists: $(ls -la public/uploads/$SAMPLE_FILE)"
    echo "File readable: $(cat public/uploads/$SAMPLE_FILE > /dev/null 2>&1 && echo 'YES' || echo 'NO')"
fi

# 7. Check PM2 logs for errors
echo -e "\n📋 Recent PM2 logs (errors only):"
pm2 logs --lines 20 | grep -i error || echo "No PM2 errors found"

# 8. Restart application
echo -e "\n🔄 Restarting application..."
pm2 restart all

echo -e "\n✅ Quick fix completed!"
echo "Please test the photo accordion now."
