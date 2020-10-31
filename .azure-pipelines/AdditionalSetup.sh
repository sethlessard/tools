#1/bin/bash
echo "Starting Xvfb.."

/usr/bin/Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &

sleep 5

echo "Started Xvfb.."
