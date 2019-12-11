# mmo-pattenrs
Gestiona un grupo de patrones de expresiones regulares y las funciones que analizan sus resultados.

## Uso
Devuelve la función que creará el objeto RegExpPatterns.

```js
const mmo_patterns=require('mmo-patterns');
const patterns= mmo_paterns({
    key: pattern,
    ...
});
```
* `key`: Clave que recibirá el patrón. Esta clave será convertida en mayusculas e incorporada al objeto como propiedad constante cuyo valor será el id númerico que identificará dicho patrón.
* `pattern`: Patrón asociado a la clave. Este patrón permite la ubicación de marcadores de posición con el formato `%CLAVE`, donde clave es la otorgada a cualquiera de los otros patrones pasados en el objeto. Estos marcadores serán sustituidos por su correspondientes patrones para trabajar con las expresiones resultantes. Se puede escapar el caracter `%` duplicándolo.
* **retorno**: Objeto RegExpPatterns

## Objeto RegExpPatterns

Objeto que monta y vincula las expresiones regulares pasadas con las funciones que analizan sus resultados.

### método miembro `parser`
Vincula un patrón de expresión con la función que lo analiza.
```js
patterns.parser((id, demo, fn)|def);
```
* `id`: Identificador del patrón. Puede ser tanto el numéro otorgado al mismo o la clave con que se pasó en mayúsculas.
* `demo`: cadena cuyo analisis con el patrón arroja una coincidencia. Es necesaria para conocer la longitud del array de resultados generados por `RegExp` al encontrar una coincidencia.
* `fn`: función que analiza el resultado. Es del tipo `fn(match, pos)` 
    * `match`: Resultado no nulo de ejecutar la expresión regular con el patrón.
    * `pos`: Posición del resultado donde de espera encotrar los obtenidos por la expresión cuando esta forma parte de otra más compleja.
    * **retorno**: valor resultante del analisis. Puede ser de cualquier tipo en función de las necesidades.
* `def`: Objeto pares clave(`id`) valor(tupla con dos valores `demo` y `fn`). Se asignará un analizador por cada entrada.

## método miembro `create`
Devuelve un objeto `RegExpPatternParser` que será el encargado de analizar las cadenas.


```js
    const parser= patterns.create(...keys);
```
* `keys`: Cadena o array de las mismas. Cada cadena será una clave de las definidas o una lista de estas separadas por comas o espacios.
* `retorna`: Objeto `RegExpPatternParser`.

Este objeto crea internamente una expresión regular en base a las claves pasadas con el siguiente patrón:
```
    (%PAT1)|(%PAT2)|...
```
Como en toda expresión regular, el órden en que se pasan es importante ya que determina la precedencia del mismo sobre el resto.

# Objeto `RegExpPatternParser`

## generador miembro `iterator`
```
    const itor= parser(str) 
```
* `str`: Cadena a analizar en base a la cual se generará un iterador de los con los resultados de dicho análisis. 

El resultado se obtiene extrayendo todas las coincidencias generadas por la expresión regular montada y pasándolas por las funciones de analisis definidas para tal fin en el objeto RegExpPatterns.

## Ejemplos

```js
const patterns= require('mmo-patterns')({
    NMCHAR: '[_a-zA-Z0-9-]',
    NMSTART: '[_a-zA-Z]',
    IDENT: '%NMSTART%NMCHAR*',        
    ID: '#%IDENT',
    CLASS: "\\.%IDENT",
})
```
Esto genera un mapa de patrones tal que así:
```
 0) NMCHAR....: [_a-zA-Z0-9-]
 1) NMSTART...: [_a-zA-Z]
 2) IDENT.....: [_a-zA-Z][_a-zA-Z0-9-]*
 3) ID........: #[_a-zA-Z][_a-zA-Z0-9-]*
 4) CLASS.....: \.[_a-zA-Z][_a-zA-Z0-9-]*
```

Ahora podríamos comprobar las expresiones mediante:
```js
    let match;
    match=patterns.exec(patterns.CLASS, '.class'); // o...
    match=patterns.exec('CLASS', '.class');
```
lo que devolvería el resultado de ejecutar la `RegExp` generada por el patrón:
```
[ '.class', index: 0, input: '.class', groups: undefined ]
```

El siguiente paso es crear y asignar las funciones analizadoras a las claves que la necesiten, no tienen por que ser todas, sólo las que se vayan a utilizar para montar la expresión del `RegExpPatternParser`. En este caso podría usarse la misma función para los dos patrones que vamos a utilizar.

```js
function id_class_parser(match, pos) {
    return match[pos]?
        match[pos].substr(1):
        null
}
patterns.parser({
    ID:['#demo', id_class_parser],
    CLASS: ['.demo', id_class_parser]
})
```
Podemos comprabar el resultado del análisis pasando el objeto match anterior a la función miembro parser.
```js
    let match=patterns.exec('CLASS', '.class');
    let result= patterns.parse('CLASS', match);
```
Lo que devería dejar en `result` el valor `class`.
Una vez hecho esto ya se puede crear un analizador para descomponer cadenas en tokens. Esto se es:
```js
    const parser= patterns.create('ID,CLASS');
```
Y utilizar el objeto devuelto para generar un iterador sobre cualquier cadena.

```js
for (let it of parser.iterator('#main.class')) console.log(it);
```

que nos devolvería:
```
{ type: 3, name: 'ID', value: 'main' }
{ type: 4, name: 'CLASS', value: 'class' }
```

La propiedad value contiene el resultado de la función analizadorá.