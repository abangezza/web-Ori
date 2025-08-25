#!/bin/bash
# quick_test.sh - Test cepat setelah perbaikan

echo "🔧 QUICK TEST AFTER FIX"
echo "======================"

# 1. Get a sample image file properly
echo "📸 Finding sample image..."
SAMPLE_FILE=$(find public/uploads -name "*.jpg" -type f | head -1)
if [ ! -z "$SAMPLE_FILE" ]; then
    # Extract just the filename from the full path
    FILENAME=$(basename "$SAMPLE_FILE")
    echo "✅ Sample file found: $FILENAME"
    echo "📁 Full path: $SAMPLE_FILE"
    
    # Test the API endpoint
    echo -e "\n🔗 Testing API endpoint..."
    echo "URL: http://localhost:3000/api/uploads/$FILENAME"
    
    # Test with curl
    curl -I "http://localhost:3000/api/uploads/$FILENAME"
    
    # Also test with curl to get response body (first 100 chars)
    echo -e "\n📄 Response body (first 100 chars):"
    curl -s "http://localhost:3000/api/uploads/$FILENAME" | head -c 100
    echo -e "\n"
    
else
    echo "❌ No image files found in public/uploads/"
fi

# 2. Check if API is working
echo -e "\n🔗 Testing API health..."
curl -s http://localhost:3000/api/health | jq -r '.status // "ERROR"'

# 3. Check PM2 status
echo -e "\n📊 PM2 Status:"
pm2 status

echo -e "\n✅ Test completed!"
