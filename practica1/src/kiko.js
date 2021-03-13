var MemoryGame = function(GraphicServer){
    var gs = GraphicServer; // Servidor gráfico utilizado para dibujar
    var cartas = [];        // Array con las cartas del juego
    var estado = "Inicio";  // Estado del juego para indicar si has fallado, ganado, etc
    var comprobarCarta = -1; // Variable para almacenar la carta a comprobar con la siguiente
    var parejas = 0;        // Contador de parejas encontradas para saber si hemos encontrado todas
    var click = false;      // Booleano para impedir que se siga haciendo click cuando se voltean las cartas
    // Inicializador del juego
    this.initGame = function(){
        // Añadimos dos cartas de cada tipo salvo back (reverso de las cartas)
        for(key in gs.maps){
            if(key != "back"){
                cartas.push(new MemoryGameCard(key));
                cartas.push(new MemoryGameCard(key));
            }
        }

        // Desordenamos el array
        this.shuffle(cartas);

        // Llamamos al bucle del juego
        this.loop();
    }

    // Bucle del juego que dibuja el tablero cada 16ms
    this.loop = function(){
        setInterval(this.draw, 16);
    }

    // Función para dibujar el tablero
    this.draw = function(){
        // Pintamos el mensaje de la parte superior del tablero en función del estado del juego
        switch(estado){
            case "Inicio": gs.drawMessage("Juego Memoria Spectrum");break;
            case "Fallo": gs.drawMessage("Inténtalo de nuevo"); break;
            case "Pareja": gs.drawMessage("¡Pareja encontrada!"); break;
            case "Ganador": gs.drawMessage("¡Has ganado!"); break;
        }
        
        // Dibujamos cada una de las cartas por orden
        for(carta in cartas){
            cartas[carta].draw(gs, carta);          
        }
    }

    // Controlador para realizar la acción correspondiente al hacer click en una carta
    this.onClick = function(cardId){
        if(click) return; // Si las cartas se siguen volteando ignoramos el evento

        // Sentencia try-catch por si hacemos click fuera del tablero de cartas no salte error
        try{
            // Volteamos la carta
            cartas[cardId].flip();
        }catch(error){
            return;
        }

        // Si la carta ya tiene su pareja no hacemos nada, si no actuamos como se deba
        if(cartas[cardId].estado != "Encontrada"){

            // Si es la primera carta de la pareja almacenamos su Id y esperamos a que se haga click en la siguiente
            if(comprobarCarta == -1){
                comprobarCarta = cardId;
            } else{
                click = true; // Bloqueamos nuevos eventos de click hasta que procesemos el actual
                // Comprobamos si ambas cartas son iguales
                if(cartas[cardId].compareTo(cartas[comprobarCarta])){
                    
                    // Aumentamos el número de parejas encontradas
                    parejas++;

                    // Comprobamos que se haya alcanzado el número de parejas necesarias para ganar (en este caso todas las cartas)
                    if(parejas == (cartas.length/2)){
                        // Se han encontrado todas las parejas, luego pasamos a estado ganador
                        estado = "Ganador";
                    } else{
                        // No era la última pareja a encontrar, por lo que cambiamos el estado a pareja encontrada
                        estado = "Pareja";
                    }

                    // Cambiamos el estado de ambas parejas a encontrada
                    cartas[cardId].found();
                    cartas[comprobarCarta].found();
                    click = false; // Volvemos a permitir que haya eventos de click
                } else{
                    // Como no son iguales el estado pasa a ser fallo
                    estado = "Fallo";
                    // Volteamos ambas cartas al cabo de 1 segundo para que de tiempo a saber cuál era la segunda carta
                    setTimeout(
                        function(carta){
                            cartas[cardId].flip();
                            cartas[carta].flip();
                            click = false; // Volvemos a permitir que haya eventos de click
                        }
                    , 1000, comprobarCarta)
                    
                }
                // Como debemos comprobar dos cartas de nuevo vaciamos la variable con la primera carta
                comprobarCarta = -1;
            }
        }
    }

    // Función para desordenar un array
    this.shuffle = function(array){
        array.sort(() => Math.random() - 0.5);
    }
}

var MemoryGameCard = function(id){
    this.sprite = id;       // Nombre de la carta
    this.estado = "Abajo";  // Estado de la carta (Arrba, Abajo, Encontrada)

    // Función para dar la vuelta a una carta. Si la carta tiene estado "Encontrada" no hace nada
    this.flip = function(){
        if(this.estado == "Abajo"){
            this.estado = "Arriba";
        } else if(this.estado == "Arriba"){
            this.estado = "Abajo";
        }
    }

    // Cambia el estado de una carta a "Encontrada"
    this.found = function(){
        this.estado = "Encontrada";
    }

    // Compara esta carta con otherCard y devuelve true si ambas tienen el mismo nombre
    this.compareTo = function(otherCard){
        return this.sprite == otherCard.sprite;
    }

    /* Dibuja una carta en función de su estado (si está abajo dibuja una carta "back", si no la dibuja normal)
    y en la posición indicada*/
    this.draw = function(gs, pos){
        if(this.estado == "Abajo"){
            gs.draw("back", pos);
        } else{            
            gs.draw(this.sprite, pos);
        }        
    }
}