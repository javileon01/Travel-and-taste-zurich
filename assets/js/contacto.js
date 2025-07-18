document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contactForm");
    const successMessage = document.getElementById("successMessage");

    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Evita el envío del formulario y la recarga de la página

        // Mostrar el mensaje de éxito
        successMessage.classList.remove("hidden");
        successMessage.textContent = "¡Tu mensaje ha sido enviado con éxito!";

        // Limpiar el formulario
        form.classList.add("hidden");
        form.reset();

        // Ocultar el mensaje después de 3 segundos
        setTimeout(() => {
            successMessage.classList.add("hidden");
        }, 3000);

        // Mostrar el formulario después de 6 segundos
        setTimeout(() => {
            form.classList.remove("hidden");
        }, 3000);
    });
});
