AI do Sliding Tile Puzzle
=============================================

Introdução
=

Neste projeto, apresento a Inteligência Artificial utilizada no Puzzle Generator (apenas no formato 3x3), que estou a desenvolver no âmbito de outra Unidade Curricular(algumas modificações foram realizadas com o objetivo de testar os resultados de diferentes métodos).

O objetivo principal é resolver o puzzle utilizando algoritmos de Pathfinding. Para este projeto, foram implementados o A* e o BFS, cujos resultados serão comparados. Além disso, serão abordados os algoritmos Dijkstra e DFS, explicando o motivo de não terem sido incluídos no projeto final.


Explicação
=

Breadth First Search(BFS)
=

O BFS é um algoritmo de busca que explora todos os nós de um nível de profundidade antes de avançar para o próximo. Ele garante encontrar o caminho mais curto em grafos sem pesos diferentes (onde o custo entre nós é constante, como neste caso, com custo igual a 1).

Agora, abordando o exemplo prático que tenho, a função bfsSolve recebe como argumentos o estado inicial (atual) do puzzle, o estado final (o puzzle resolvido) e o tamanho do puzzle (que, neste caso, é sempre 3x3, pois, se aumentar, o custo de memória torna a solução impossível devido ao elevado número de estados). A função retorna um array com todos os estados até à solução ou null, caso não encontre uma solução.
```ts
export const bfsSolve = (
  initialState: PuzzleState,
  targetState: PuzzleState,
  gridRow: number,
  gridCol: number
): PuzzleState[] | null => {
```


Começamos por verificar se o estado inicial/atual tem solução(vai ter devido a verificações anteriores mas convém ter sempre) e retorna null se não tiver
```ts
if (!isSolvable(initialState, gridCol)) {
    console.log("Puzzle is not solvable");
    return null;
  }
```

Inicializamos uma queue, que é uma estrutura de dados responsável por armazenar os estados do puzzle que ainda precisam ser explorados. Começamos a fila com o estado inicial do puzzle e um caminho vazio, pois ainda não houve movimentos. Cada elemento da fila contém o estado atual do puzzle e o caminho percorrido até esse estado.
Em seguida, inicializamos também uma lista chamada visited para armazenar os estados já visitados. Isso previne que estados repetidos sejam explorados novamente, evitando loops infinitos e perda de eficiência. Por fim, adicionamos o estado inicial à lista de visitados.
```ts
const queue: { state: PuzzleState; path: PuzzleState[] }[] = [{ state: initialState, path: [] }];
  const visited = new Set<string>();
  visited.add(JSON.stringify(initialState));
```

Começamos um loop que continua enquanto a queue não estiver vazia, o que significaria que não há mais estados para explorar. Usando a abordagem FIFO (First In, First Out), removemos o primeiro estado da fila e obtemos o caminho percorrido até agora e o estado atual desse elemento.
```ts
 while (queue.length > 0) {
    const { state, path } = queue.shift()!;
```

Se o estado atual for igual ao estado alvo (ou solução), retornamos o caminho até esse ponto.
```ts
if (isSolved(state, targetState)) {
      return path;
    }
```
Caso contrário, obtemos os estados possíveis a partir dos movimentos válidos do estado atual e, para cada novo estado, verificamos se ele já foi visitado. Se ainda não foi visitado, marcamos como visitado e adicionamos o novo estado à fila, junto com o caminho atualizado. Este processo é repetido até que uma solução seja encontrada ou até que a fila fique vazia, o que indicaria que não há solução.
```ts
const validMoves = getValidMoves(state, gridRow, gridCol);
    for (const move of validMoves) {
      const moveKey = JSON.stringify(move);
      if (!visited.has(moveKey)) {
        visited.add(moveKey);
        queue.push({
          state: move,
          path: [...path, move],
        });
      }
    }
  }

  console.log("No solution found");
  return null;
};
```
