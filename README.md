## Lab ARSW6

## Daniel Ricardo Ruge Gomez

### Ajustes Backend

Ajustamos las dependencias en el pom 

![alt text](/Back/img/media/image.png)


### Front-End - Vistas

#### 1

creamos el directorio donde ira nuestro front

![alt text](/Back/img/media/image2.png)

#### 2

 Creamos index.html que cumple con lo solicitado. Tiene un campo para capturar el autor, un botón “Get blueprints”, un área para mostrar el autor seleccionado, una tabla con encabezados para listar los planos y un campo para mostrar el total de puntos. Todos los elementos cuentan con identificadores (id) que facilitan su manipulación mediante JavaScript, y se aplicaron estilos básicos con Bootstrap.

![alt text](/Back/img/media/image3.png)

#### 3

agregamos las referencia a las librerías de jQuery, Bootstrap y a la hoja de estilos de Bootstrap.

![alt text](/Back/img/media/image4.png)

#### 4

verificamos que la pagina sea accesible

![alt text](/Back/img/media/image5.png)

No aparece error 404 en la consola del navegador indicando que las librerías de JavaScript se cargaron correctamente

![alt text](/Back/img/media/image6.png)


### Front-End - Lógica

#### 1

creaamos un Módulo JavaScript que, a manera de controlador, mantenga los estados y ofrece las operaciones requeridas por la vista.

![alt text](/Back/img/media/image7.png)


### 2

creamos  un apimock con autores 'quemados' en el código.

![alt text](/Back/img/media/image8.png)


### 3

Agreguamos la importación de los dos nuevos módulos a la página HTML

![alt text](/Back/img/media/image9.png)


### 4

Se cambió el módulo para que mantenga de forma privada el autor seleccionado, la lista de planos con nombre y número de puntos, y el total de puntos; además, se agregaron funciones privadas para calcular el total y actualizar la vista, y se expusieron solo operaciones públicas controladas: setAuthor para cambiar el autor y fetchBlueprints para obtener los planos desde el backend.

![alt text](/Back/img/media/image10.png)


### 5

puse una nueva función pública en app.js que usa apimock.js para actualizar los planos de un autor con map y reduce, y luego actualiza la tabla y el total con jQuery, tambien se agregó a apimock.js una nueva función pública getBlueprintsByAuthor(author, callback) que permite obtener la lista completa de planos de un autor mediante un callback

![alt text](/Back/img/media/image11.png)



### 6 

implementamos dentro de index.html

![alt text](/Back/img/media/image12.png)


### 7

Verificamos el funcionamiento

![alt text](/Back/img/media/image13.png)


### 8

agregamos el canvas

![alt text](/Back/img/media/image14.png)

![alt text](/Back/img/media/image15.png)


### 9

Se agregó a app.js una operación pública drawBlueprint(author, planName) que, usando getBlueprintsByNameAndAuthor de apimock.js, obtiene los puntos de un plano específico y dibuja sus segmentos consecutivos en el canvas HTML5; además, actualiza o crea dinámicamente un campo en el DOM que muestra el nombre del plano que se está dibujando.

![alt text](/Back/img/media/image16.png)


### 10 y 11 

Verificamos que dibuje 

![alt text](/Back/img/media/image17.png)


### 12

creamos el modulo apiclient

![alt text](/Back/img/media/image18.png)


### 13 

agregamos los botones para alternar entre el mock y el API real

![alt text](/Back/img/media/image19.png)

### 14

Segun las imagenes de todo el laboratorio la pagina ya tiene lo necesario para que sea más vistosa cercana al mock dado al inicio del enunciado.

