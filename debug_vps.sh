#!/bin/bash
# debug_vps.sh - Script untuk debugging VPS deployment

echo "🔍 DEBUGGING VPS DEPLOYMENT"
echo "=========================="

# Check current directory
echo "📁 Current working directory:"
pwd

# Check if uploads directory exists
echo -e "\n📸 Checking uploads directories:"
for dir in "public/uploads" "uploads" "/var/www/html/public/uploads" "/home/*/public_html/public/uploads"; do
    if [ -d "$dir" ]; then
        echo "✅ Found: $dir"
        echo "   Files count: $(find "$dir" -type f -name "*.jpg" -o -name "*.png" -o -name "*.jpeg" -o -name "*.webp" | wc -l)"
        echo "   Directory size: $(du -sh "$dir" 2>/dev/null | cut -f1)"
        echo "   Permissions: $(ls -la "$dir" | head -1)"
        echo "   Sample files:"
        ls -la "$dir" | head -5 | tail -4
    else
        echo "❌ Not found: $dir"
    fi
done

# Check Node.js process
echo -e "\n🟢 Node.js processes:"
ps aux | grep node | grep -v grep

# Check port usage
echo -e "\n🔌 Port usage:"
netstat -tulpn | grep :3000

# Check disk space
echo -e "\n💾 Disk space:"
df -h

# Check memory usage
echo -e "\n🧠 Memory usage:"
free -h

# Check recent logs
echo -e "\n📋 Recent PM2 logs (if using PM2):"
if command -v pm2 &> /dev/null; then
    pm2 logs --lines 10
else
    echo "PM2 not found"
fi

# Check environment variables
echo -e "\n🌍 Environment variables:"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "MONGODB_URI: $(if [ -n "$MONGODB_URI" ]; then echo "✅ Set"; else echo "❌ Not set"; fi)"
echo "NEXTAUTH_SECRET: $(if [ -n "$NEXTAUTH_SECRET" ]; then echo "✅ Set"; else echo "❌ Not set"; fi)"

# Test API endpoints
echo -e "\n🔗 Testing API endpoints:"
echo "Testing /api/health..."
curl -s http://localhost:3000/api/health | head -200

echo -e "\nTesting /api/mobil..."
curl -s http://localhost:3000/api/mobil | head -200

# Check for common issues
echo -e "\n⚠️ Common issues check:"
echo "1. File permissions:"
find public/uploads -type f | head -5 | while read file; do
    echo "   $file: $(ls -la "$file" 2>/dev/null || echo 'not found')"
done

echo "2. Directory permissions:"
ls -la public/ | grep uploads

echo "3. Next.js build:"
if [ -d ".next" ]; then
    echo "   ✅ .next directory exists"
    echo "   Size: $(du -sh .next)"
else
    echo "   ❌ .next directory missing"
fi

echo -e "\n✅ Debug completed!"