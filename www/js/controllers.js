angular.module('starter.controllers', ['firebase'])

.controller('CadastroController', function($scope, $rootScope, $ionicModal, $ionicLoading, $firebaseObject, $firebaseArray, alunoService, periodoService) {
  console.log("CadastroController");
  $ionicModal.fromTemplateUrl('templates/kid.html', {
    scope: $scope
  }).then(function(modalKid) {
    $scope.modalKid = modalKid;
  });

  $ionicModal.fromTemplateUrl('templates/add.html', {
    scope: $scope
  }).then(function(modalAdd) {
    $scope.modalAdd = modalAdd;
  });

  $rootScope.$on("loadAlunos", function(){
     $scope.loadAlunos();
  });

  $scope.loadAlunos = function loadAlunos() {
    $ionicLoading.show();
    console.log(firebase.auth());

    alunoService.loadAlunos().$loaded().then(function(alunos){
      $scope.alunos = alunos;
      periodoService.loadPeriod();
      $ionicLoading.hide();
    })
  }
  /*
  function loadPeriod() {

    var periodosRef = firebase.database().ref().child('periodo');
    periodos = $firebaseArray(periodosRef);

    periodos.$loaded().then(function() {
      checkNewPeriod(periodos);

      $scope.periodos = [];

      for (var i = 0; i < periodos.length; i++) {
        var per = {
          mes: periodos[i].periodo.substring(0,1),
          ano: periodos[i].periodo.substring(2,6)
        }
        $scope.periodos.push(per);
      }

      $scope.periodos = periodoService.converteMes($scope.periodos);
    })

  }

  function checkNewPeriod(periodos) {
    var d = new Date();
    var mes = d.getMonth();
    var ano = d.getFullYear();
    var flagJaExistePer;
    if(mes < 10){
      mes = "0" + mes;
    }

    var per = mes.toString() + ano.toString();
    console.log(periodos);

    // periodo ainda nao existe
    for (var i = 0; i < periodos.length; i++) {
      if(periodos[i].periodo == per)
        flagJaExistePer = true;
    }

    if(!flagJaExistePer){
      periodos.$add({
        periodo: per
      }).then(function(){

      })
    }
  } */

  $scope.openKid = function(aluno){

    $scope.aluno = aluno;
    var mensalidadesRef = firebase.database().ref().child('mensalidades').orderByChild('aluno').equalTo(aluno.$id);
    mensalidades = $firebaseArray(mensalidadesRef);
    mensalidades.$loaded().then(function() {
      $scope.mensalidades = mensalidades;
      $scope.aluno.inadimplente = alunoService.isInadimplente(mensalidades, aluno.contratoVencimento);
    })

    console.log($scope.aluno);

    $scope.modalKid.show();
  }

  $scope.openAdd = function(){
    $scope.modalAdd.show();
  }
})

.controller('kidController', function($scope, $state, $ionicPopup, $firebaseArray, $firebaseObject, $ionicModal, alunoService) {
  console.log('kidController');

  $ionicModal.fromTemplateUrl('templates/editKid.html', {
    scope: $scope
  }).then(function(modalEditKid) {
    $scope.modalEditKid = modalEditKid;
  });

  $scope.openEditKid = function(){
    console.log("openEditKid;");
    $scope.modalEditKid.show();
  }

  $scope.pagaMensalidade = function(mensalidade){

    mensalidades.$save(mensalidade).then(function(){
      const idAluno = mensalidade.aluno;
      let mensalidadesRef = firebase.database().ref().child('mensalidades').orderByChild('aluno').equalTo(idAluno);
      let mensalidades = $firebaseArray(mensalidadesRef);

      mensalidades.$loaded().then(function(){
        let alunoRef = firebase.database().ref().child('aluno').child(idAluno);
        let aluno = $firebaseObject(alunoRef);

        aluno.$loaded().then(function(){
          aluno.inadimplente = alunoService.isInadimplente(mensalidades, aluno.contratoVencimento);
          aluno.$save();
        })
      })
    });
  }

  $scope.showComprovantePopup = function(mensalidade) {

    // An elaborate, custom popup
    var comprovantePopup = $ionicPopup.show({
      templateUrl: "templates/comprovantePopup.html",
      title: 'Comprovante',      
      scope: $scope,
      buttons: [
        { text: 'Voltar' }
      ]
    })

    comprovantePopup.then(function(res) {
      console.log('Tapped!', res);
    });
  }
  $scope.share = function(t, msg, img, link){
    console.log(window);
     if(t == 'w')
         window.plugins.socialsharing
         .shareViaWhatsApp('Comprovante mensalidade 01/2017', '', link);
     else if(t == 'f')
         window.plugins.socialsharing
         .shareViaFacebook(msg, img, link);
     else if(t == 't')
         window.plugins.socialsharing
         .shareViaTwitter(msg, img, link);
     else if(t == 'sms')
         window.plugins.socialsharing
         .shareViaSMS(msg+' '+img+' '+link);
     else
     {
         var sub = 'Beautiful images inside ..';
         window.plugins.socialsharing
         .shareViaEmail(msg, sub, '');
     }
  }

  $scope.gerarComprovante = function(mensalidade){

  }

  $scope.closeKid = function(){
    $scope.modalKid.hide();
  }

})

.controller('editKidController', function($scope, $state, $ionicLoading, $firebaseObject, $firebaseArray, periodoService) {

  $scope.closeEditKid = function(){
    $scope.modalEditKid.hide();
  }

  function getAluno(_aluno){
    let ref = firebase.database().ref().child('aluno').child(_aluno.$id);
    let res = $firebaseObject(ref);
    return res.$loaded();
  }

  $scope.save = function(aluno){
    getAluno(aluno).then(function(aluno){
      aluno.$save()
      .then(function(){
        console.log("Aluno alterado");
        $scope.modalEditKid.hide();
      })
      .catch(function(err){
        console.log("Erro ao alterar MSG", err);
      })
    })
  }

  $scope.remove = function(aluno){
    getAluno(aluno).then(function(aluno){
      aluno.$remove()
      .then(function(){
        console.log("Aluno removido");
        aluno = {};
        $scope.modalEditKid.hide();
        $scope.modalKid.hide();
      })
      .catch(function(err){
        console.log("Erro ao remover MSG", err);
      })
    })
  }

})

.controller('addController', function($scope, $state, $ionicLoading, $firebaseObject, $firebaseArray, periodoService) {

  $scope.add = function(addAluno){

    $ionicLoading.show();

    var ref = firebase.database().ref().child('aluno');
    alunos = $firebaseArray(ref);

    addAluno.idade = _calculateAge(addAluno.dataNascimento);

    console.log(alunos);

      alunos.$add({
        nome: addAluno.nome,
        idade: addAluno.idade,
        responsavel: addAluno.responsavel,
        email: addAluno.email,
        inadimplente: true,
        dataNascimento: addAluno.dataNascimento.getTime(),
        contratoVigencia: addAluno.contratoVigencia,
        contratoVencimento: addAluno.contratoVencimento,
        telefone: addAluno.telefone
      }).then(function(ref){
        console.log("Aluno adicionado");

        adicionarMensalidade(ref.key, addAluno.contratoVigencia);

        addAluno = limparAluno(addAluno);

        $scope.modalAdd.hide();
        $ionicLoading.hide();
      }).catch(function(error){
        console.log(error);
      });
  }

  function limparAluno(addAluno) {
    addAluno.nome = "";
    addAluno.idade = "";
    addAluno.responsavel = "";
    addAluno.email = "";
    addAluno.dataNascimento = "";
    addAluno.contratoVigencia = null;
    addAluno.contratoVencimento = null;
    addAluno.telefone = "";
    return addAluno;
  }

  function _calculateAge(birthday) { // birthday is a date
    let ageDifMs = Date.now() - birthday.getTime();
    let ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  $scope.closeAdd = function(addAluno){
    if(addAluno){
      addAluno = limparAluno(addAluno);
    }
    $scope.modalAdd.hide();
  }

  function adicionarMensalidade(key, contratoVigencia) {
    console.log("adicionarMensalidade");
    let mensalidadesRef = firebase.database().ref().child('mensalidades');
    let mensalidades = $firebaseArray(mensalidadesRef);
    let d = new Date();
    let mes = d.getMonth();
    let ano = d.getFullYear();

    console.log("contratoVigencia", contratoVigencia);
    for (var i = 0; i < contratoVigencia; i++) {
      mensalidades.$add({
        aluno: key,
        ano: ano,
        mes: mes,
        pago: false
      }).then(function(){
        console.log(i);
      })
      mes++;
      if(mes > 12){
        mes = 1;
        ano++;
      }
    }
  }
})

.controller('SettingsController', function($scope, $state) {
  console.log("SettingsController");
  $scope.signOut = function(){
    console.log('aqui');
    firebase.auth().signOut().then(function() {
      $state.go('login');
    }, function(error) {
      console.log("An error happened");
    });
  }
  /*
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      $state.go('tab.cadastro');
    }else{
      $state.go('login');
    }
  })*/
})

.controller('FotosController', function($scope, $ionicModal, $ionicLoading, $firebaseObject, $firebaseArray, $ionicLoading, alunoService) {

    $ionicModal.fromTemplateUrl('templates/kid.html', {
      scope: $scope
    }).then(function(modalKid) {
      $scope.modalKid = modalKid;
    });

    $scope.loadAlunos = function loadAlunos() {
      $ionicLoading.show();
      alunoService.loadAlunos().$loaded().then(function(){
        $scope.alunos = alunoService.loadAlunos();
        $scope.inadimplentes = $scope.countInadimplentes();
        $ionicLoading.hide();
      })
    }

    $scope.openKid = function(aluno){

      $scope.aluno = aluno;
      var mensalidadesRef = firebase.database().ref().child('mensalidades').orderByChild('aluno').equalTo(aluno.$id);
      mensalidades = $firebaseArray(mensalidadesRef);
      mensalidades.$loaded().then(function() {
        $scope.mensalidades = mensalidades;
        $scope.aluno.inadimplente = alunoService.isInadimplente(mensalidades, aluno.contratoVencimento);
      })

      console.log($scope.aluno);

      $scope.modalKid.show();
    }


    $scope.countInadimplentes = function(){
      var cont = 0
      var alunos = $scope.alunos;

      $scope.inadimplentes = "...";

      //todos os alunos
      alunos.$loaded().then(function(){
        console.log(alunos);
        for (var i = 0; i < alunos.length; i++) {
          if(alunos[i].inadimplente)
            cont++;
        }
        console.log(cont);
        $scope.inadimplentes = cont;
      })
    }
})

.controller('FavoritosController', function($scope) {})

.controller('LoginController', function($scope, $rootScope, $state, $ionicLoading, alunoService) {

  $scope.user = {};

  $scope.checkUser = function(){

    var user = firebase.auth().currentUser;

    firebase.auth().onAuthStateChanged(function(user) {
      console.log(user);
      if (user) {
        $rootScope.$emit("loadAlunos", {});

        $state.go('tab.cadastro');
        $ionicLoading.hide();
      }else{
        $state.go('login');
      }
    });

  }

  $scope.login = function(user){

    $ionicLoading.show();

    var email = "";
    var password = "";

    if((!user.email)||(!user.password)){
      $ionicLoading.hide();
      swal("Desculpe", "Login inválido", "error");
      return;
    }

    email = user.email;
    password = user.password;
    //cadastrar novo usuario
    //$scope.signUp(user);

    firebase.auth().signInWithEmailAndPassword(email, password)
    .catch(function(error) {
      $ionicLoading.hide();
      swal("Desculpe", "Login inválido", "error")

      var errorCode = error.code;
      var errorMessage = error.message;

      console.log(errorCode);

    }).then(() => {
      $ionicLoading.hide();

      alunoService.loadAlunos().$loaded().then(function(alunos){
        $rootScope.$emit("loadAlunos", {});

        $state.go('tab.cadastro');
        $ionicLoading.hide();
      })

    });

  }

  $scope.signUp = function(user){

    firebase.auth().createUserWithEmailAndPassword(user.email, user.password).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode);
      console.log(errorMessage);
      // ...
    });
  }

});
