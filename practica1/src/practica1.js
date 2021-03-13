
var MemoryGame = function(gs){
	
	var gs = gs;	// servidor gráfico para mostrar el juego
	var estado = "inicio";	// usado para indicar el estado del juego en el momento
	var cartas = []; // variable donde se acumulan las cartas del juego
	var cartaActual = -1;	// variable usada para marcar la primera carta girada cuando se gire la segunda
	var parejasEncontradas = 0;	// conteo de las parejas encontradas actualmente
	var prevenirClick = false;	// variable para bloquear seguir haciendo click mientras las cartas están giradas y siendo comprobadas

	// inicializador del juego
	this.initGame = function(){
		for(key in gs.maps){	// se añaden 2 cartas de cada tipo en estado "boca abajo"
			if(key != "back"){
				cartas.push(new MemoryGameCard(key));
				cartas.push(new MemoryGameCard(key));
			}
		}
		
		this.shuffle(cartas);	// desordena el array
		this.loop();	// realiza el bucle del juego
	}
	
	// función que dibuja el tablero
	this.draw = function(){
		switch(estado){	// se pinta el mensaje superior del juego en base al estado del juego en cada momento
            case "inicio":
				gs.drawMessage("Juego Memoria Spectrum");
			break;
			case "pareja":
				gs.drawMessage("¡Pareja encontrada!");
			break;
			case "fallo":
				gs.drawMessage("Inténtalo de nuevo");
			break;
			case "victoria":
				gs.drawMessage("¡Has ganado!");
			break;
		}
		
		for(carta in cartas){	// se dibujan las cartas en el tablero
			cartas[carta].draw(gs, carta);
		}
	}
	
	// función del bucle del juego que lo dibuja cada 16 ms
	this.loop = function(){
		setInterval(this.draw, 16);
	}
	
	// función de la acción correspondiente al pulsar en las cartas
	this.onClick = function(cardId){
		
		if(prevenirClick)	// hace prevenir hacer click si hay 2 cartas giradas
			return;

		// try-catch control en caso de pulsar fuera de la zona de cartas
		try{
			cartas[cardId].flip();	// se gira la carta a "cara arriba"
		}catch(error){
			return;
		}
		
		// si la carta ha sido encontrada con pareja no hace nada, efectúa en caso contrario
		if(cartas[cardId].estado != "encontrada"){
			
			if(cartaActual == -1){	// si no hay una carta girada para comprobar pareja se pone la actual como tal
				cartaActual = cardId;
			}
			else{
				prevenirClick = true;	// bloqueo de click hasta comprobar las cartas actuales
				
				if(cartas[cardId].compareTo(cartas[cartaActual])){	// se comprueban si las cartas son iguales
					
					parejasEncontradas++;	// aumenta la cantidad de parejas encontradas
					
					if(parejasEncontradas == (cartas.length / 2)){	// comprueba si se han encontrado todas las parejas
						estado = "victoria";	// se han encontrado todas la parejas y el juego se acaba en victoria
					}
					else{	// faltan parejas y se continúa el juego
						estado = "pareja";
					}
					
					// se marcan como "encontrada" las cartas emparejadas
					cartas[cardId].found();
					cartas[cartaActual].found();
					
					prevenirClick = false;	// se desbloquea poder hacer click a las cartas
				}
				else{	// al no ser iguales las cartas
					estado = "fallo";	// juego en estado "fallo" que significa que el jugador se ha equivocado
					
					// se giran las cartas a "boca abajo" con margen de tiempo para visualizar como eran las cartas
					setTimeout(
						function(carta){
							cartas[cardId].flip();
							cartas[carta].flip();
							prevenirClick = false; // se desbloquea poder hacer click a las cartas
						}
					, 1000, cartaActual)
				}
				
				cartaActual = -1;	// se "vacia" la variable comprobador para poder volver a girar otras cartas
			}
		}
	}
	
	// función para desordenar el array
	this.shuffle = function(array){
        array.sort(() => Math.random() - 0.5);
    }
}


var MemoryGameCard = function(sprite){
	
	this.sprite = sprite;	// imagen de la carta
	this.estado = "boca abajo";	// estado actual de la carta
	
	// función para girar la carta de "boca arriba" a "boca abajo" y viceversa
	this.flip = function(){
		if(this.estado == "boca abajo"){
			this.estado = "boca arriba";
		}
		else if(this.estado == "boca arriba"){
			this.estado = "boca abajo";
		}
	}
	
	// cambia el estado de la carta a "encontrada"
	this.found = function(){
		this.estado = "encontrada";
	}
	
	// compara dos cartas para comprobar si tienen la misma imagen
	this.compareTo = function(otherCard){
		return this.sprite == otherCard.sprite
	}
	
	// dibuja la carta según su estado actual
	this.draw = function(gs, pos){
		if(this.estado == "boca abajo"){
			gs.draw("back", pos);
		}
		else{
			gs.draw(this.sprite, pos);
		}
			
	}
}
