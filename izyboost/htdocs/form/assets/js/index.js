function animer(){
    $('#anim_content').addClass('anim');
}
function stop(){
     setInterval(
                function() {
                    $('#anim_content').removeClass('anim');
                }, 
                1000
            );
}

$(document).ready(function () {
    $('#form').submit(function (e) {
        e.preventDefault();
        animer();
        

        let donnees = $(this).serialize();
        let nom = $('#nom').val();
        let numero = $('#numero').val();

        if (nom === '' || numero === '') {
            $('#resultat').text("Veuillez remplir tous les champs.");
           stop()
        } 
        else {
            $.ajax({
                type: "POST",
                url: "api/index.php",
                data: donnees,
                dataType: "json",
                success: function (response) {
                 
                    $('#resultat').text(response.message);
              
                        stop();
                        window.location.href='api/users.php'
                },
                error: function (xhr, status) {
                    $('#resultat').text("inscription echouer");
                    console.log("Erreur de ajax :");
                
                        stop()
                }
            });
        }
    });
       
});

