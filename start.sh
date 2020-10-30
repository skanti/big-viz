cd ./client && npm run dev & 
P1=$!
cd ./server && npm run dev &
P2=$!
wait $P1 $P2

