## Lab ARSW7 Parte 1

## Daniel Ricardo Ruge Gomez

### Construción de un cliente 'grueso' con un API REST, HTML5, Javascript y CSS3. Parte II.


#### 1

Se agregó un manejador de eventos al canvas mediante PointerEvent dentro de la función initCanvasEvents() del módulo BlueprintsModule, para capturar los clics realizados con mouse o pantalla táctil y dibujar un pequeño punto rojo en la posición seleccionada. Además, se modularizó esta inicialización y se llamó desde index.html al cargar la página

![alt text](./Back/img/media/image.png)

#### 2

Se añadieron manejadores de eventos para capturar los clics en el canvas y registrar las coordenadas solo si hay un canvas seleccionado. Cada nuevo punto se agrega a la secuencia de puntos almacenada en memoria y luego se repinta el dibujo en pantalla, sin enviar aún los datos al backend.

antes:

![alt text](./Back/img/media/image2.png)

despues:

![alt text](./Back/img/media/image3.png)