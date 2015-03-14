To be able to use it - run in browser console first

```
$.ajax({
  method: 'POST',
  url: 'http://localhost:3000/sign-up',
  xhrFields: {withCredentials: true},
  data: {user: {username: 'pman1', password: '177591', confirm: '177591'}}
}).success(function(data) {
  console.log(data)
});

$.ajax({
  method: 'POST',
  url: 'http://localhost:3000/login',
  data: {
    username: 'pman',
    password: '177591'
  },
  xhrFields: {withCredentials: true}
}).success(function(data) {
    console.log(data);
});

```
