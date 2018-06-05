App para integrar distintas aplicaciones de web chats.

Para agregar una aplicación de chat se debe hacer un request POST a https://awebchat-integration.herokuapp.com/integrate
con el siguiente json en el body:

```
{
  "id": "IDENTIFICADOR DE APP",
  "endpoint": "API DONDE RECIBE MENSAJES POR POST"
}
```

Luego si se desea enviar un mensaje hacia las demás aplicaciones se debe hacer un request POST a https://awebchat-integration.herokuapp.com/send con la siguiente estructura en el body.

```
{
  "from": "NOMBRE DE USUARIO SENDER",
  "msg": "MENSAJE",
  "to": "NOMBRE DE USUARIO RECEIVER",
  "attachment": "ATTACHMENT, TBD",
  "sourceApp": "IDENTIFICADOR APP SENDER",
  "targetApp": "IDENTIFICADOR APP RECEIVER EN CASO MENSAJE PRIVADO",
}
```
