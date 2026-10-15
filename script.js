const yearElement = document.getElementById('year');

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

const form = document.querySelector('.booking-form');

if (form) {
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const nombre = form.querySelector('input[name="nombre"]')?.value?.trim() || 'Cliente';
        const servicio = form.querySelector('select[name="servicio"]')?.value || 'servicio';
        const mensaje = form.querySelector('textarea[name="mensaje"]')?.value?.trim() || 'Quiero reservar una cita';

        const whatsappUrl = `https://wa.me/522205427583?text=${encodeURIComponent(
            `Hola MTS Studio, mi nombre es ${nombre}. Me interesa el servicio de ${servicio}. ${mensaje}`
        )}`;

        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

        const button = form.querySelector('button');
        if (button) {
            const originalText = button.textContent;
            button.textContent = 'Redirigiendo...';
            button.disabled = true;

            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
                form.reset();
            }, 1800);
        }
    });
}

console.log('MTS Studio - Página cargada con estilos premium');