# We need this so that the tests can run in a secure context
socat TCP-LISTEN:8000,fork TCP:web:80 &

cd /src

"$@"
