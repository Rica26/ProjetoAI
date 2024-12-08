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
A*
=
O A*, ao contrário do BFS, é um algoritmo de Pathfinding que usa heurísticas (no meu caso, a distância de Manhattan) para alcançar a solução ótima e é definido pela fórmula f=g+h, melhorando significativamente a rapidez e a eficiência da busca. A distância de Manhattan é uma heurística ideal para grids, pois reflete exatamente o tipo de movimentação permitida (movimentos ortogonais: cima, baixo, esquerda, direita). Em vez de calcular a distância reta (euclidiana), calcula a soma das diferenças absolutas das coordenadas nos eixos x e y (no nosso caso, col e row, respectivamente).

No caso do meu projeto, primeiro faço o cálculo da heurística (distância de Manhattan) para determinar o quão longe está cada peça da sua posição alvo. Para isso, inicializo a distância total como 0 e percorro cada peça do estado atual fornecido à função. Durante a iteração, identifico a posição atual de cada peça (linha e coluna) no tabuleiro e, em seguida, localizo a posição alvo correspondente dessa peça no estado final.
Para calcular a distância, utilizo a soma das diferenças absolutas entre as coordenadas da posição atual e da posição alvo, considerando os eixos row (linha) e col (coluna).
Por fim, somo as distâncias individuais de todas as peças, obtendo a distância total, que será usada como heurística.
```ts
const manhattanDistance = (state: PuzzleState, gridRow: number, gridCol: number, targetState: PuzzleState): number => {
  let distance = 0;
  for (let i = 0; i < state.length; i++) {
    if (state[i] !== null) {
      const currentRow = Math.floor(i / gridCol);
      const currentCol = i % gridCol;
      const targetIndex = targetState.indexOf(state[i])!;
      const targetRow = Math.floor(targetIndex / gridCol);
      const targetCol = targetIndex % gridCol;
      distance += Math.abs(currentRow - targetRow) + Math.abs(currentCol - targetCol);
    }
  }
  return distance;
};
```

A função que usa o algoritmo, aStarSolve, recebe como argumentos e retorna exatamente a mesma coisa que a bfsSolve que já expliquei anteriormente
```ts
export const aStarSolve = (
  initialState: PuzzleState,
  targetState: PuzzleState,
  gridRow: number,
  gridCol: number
): PuzzleState[] | null => {
```
De seguida, inicializamos uma lista aberta e uma lista fechada. A lista aberta é semelhante à queue usada no bfsSolve, armazenando os estados que ainda precisam de ser explorados. No entanto, ao contrário da queue do BFS, a lista aberta armazena, além do estado atual e do caminho até lá, os valores de g, h e f. O g representa o custo acumulado para alcançar o estado atual a partir do estado inicial, enquanto o h é a heurística. O valor de f é a soma de g e h. A lista fechada, por sua vez, tem um papel semelhante à lista de visitados no bfsSolve, sendo responsável por armazenar os estados já explorados, evitando a exploração repetida dos mesmos e, assim, prevenindo loops infinitos e a perda de eficiência. Depois, colocamos o estado inicial na lista aberta, com o caminho vazio, g igual a 0, h calculado pela função auxiliar da distância de Manhattan e f usando a mesma função para h, já que g é 0 no início.
```ts
const openList: { state: PuzzleState; path: PuzzleState[]; g: number; h: number; f: number }[] = [];
  const closedList = new Set<string>();

  openList.push({
    state: initialState,
    path: [],
    g: 0,
    h: manhattanDistance(initialState, gridRow, gridCol, targetState),
    f: manhattanDistance(initialState, gridRow, gridCol, targetState),
  });
```
Começamos um loop que continua enquanto a lista aberta não estiver vazia. Dentro do loop, transformamos a lista aberta numa priority queue, ordenando os elementos com base no valor de f(os com menor valor de f têm prioridade). Em seguida, verificamos se o estado atual é a solução. Caso seja, retornamos o caminho de estados até esse aqui.
```ts
while (openList.length > 0) {
    openList.sort((a, b) => a.f - b.f);
    const current = openList.shift()!;

    if (isSolved(current.state, targetState)) {
      return current.path;
    }
```
Adicionamos o estado atual à lista fechada, obtemos os estados possíveis a partir dos movimentos válidos do estado atual e, para cada novo estado, verificamos se ele já foi visitado. Se não foi, calculamos g, h e adicionamos ambos para obter o f, adicionando o novo estado com esses parâmetros à lista aberta. Repetimos este processo até encontrarmos a solução ou a lista aberta ficar vazia
```ts
closedList.add(JSON.stringify(current.state));
    const validMoves = getValidMoves(current.state, gridRow, gridCol);
    for (const move of validMoves) {
      const moveKey = JSON.stringify(move);

      if (!closedList.has(moveKey)) {
        const g = current.g + 1;
        const h = manhattanDistance(move, gridRow, gridCol, targetState);
        const f = g + h;

        openList.push({
          state: move,
          path: [...current.path, move],
          g,
          h,
          f,
        });
      }
    }
  }
  return null;
```

Comparações
=

No programa em si adicionei um contador que conta os movimentos até chegar à solução e o tempo que o algoritmo demora a chegar à solução. Comparando ambos os números, no que toca a tempo de execução o A* é bastante mais rápido que o bfs a chegar à solução e no que toca a movimentos também, em média, tem menos do que o bfs mas a diferença não é significativa

![image](https://github.com/user-attachments/assets/65573e6d-cf0d-4716-b38e-2ecf62eb2b98)
![image](https://github.com/user-attachments/assets/23f04555-a2ab-4830-817e-f3b035f655af)

Dois exemplos do A*

![image](https://github.com/user-attachments/assets/5a1ec00b-94e3-459e-ab7d-0a663cd7d6ca)
![image](https://github.com/user-attachments/assets/5ea02ac1-6184-4930-b70a-caf2baed835d)

Dois exemplos do BFS


Também tentei aplicar o DFS para fazer comparações, mas não conseguiu resolver o problema, ficando infinitamente à procura da solução. Não tentei aplicar o Dijkstra, porque os pesos são todos iguais, o que torna o BFS automaticamente mais eficiente para este tipo de problema.

Conclusão
=
Concluindo, vejo que o A* é um algoritmo mais eficiente, especialmente em termos de tempo de execução, pois utiliza heurísticas para a busca, escolhendo sempre o caminho com o menor valor de f. Isso evita a exploração de estados desnecessários, tornando o processo mais rápido e otimizado comparando com o BFS. Embora o BFS seja uma solução garantida para encontrar o caminho mais curto, ele acaba a explorar mais estados do que o necessário, resultando num maior tempo de execução.

O A* destaca-se pela sua inteligência na escolha de caminhos, combinando a exploração de estados com uma função heurística (distância de Manhattan) para priorizar movimentos que levam à solução de forma mais eficiente. No entanto, em termos de número de movimentos, a diferença entre A* e BFS não é assim tão significativa, embora o A* ainda consiga, em alguns casos, reduzir o número de movimentos.


