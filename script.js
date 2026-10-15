const yearElement = document.getElementById('year');

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

const form = document.querySelector('.booking-form');

if (form) {
    const dateInput = form.querySelector('input[name="fecha"]');
    const timeInput = form.querySelector('input[name="hora"]');
    const dateTrigger = form.querySelector('[data-date-trigger]');
    const calendar = form.querySelector('#date-picker-calendar');
    const calendarGrid = form.querySelector('[data-calendar-grid]');
    const timeSlots = form.querySelector('[data-time-slots]');
    const selectedDateLabel = form.querySelector('[data-selected-date]');
    const dateError = form.querySelector('[data-date-error]');
    const timeError = form.querySelector('[data-time-error]');

    const updateAvailableBookingDates = () => {
        if (!(dateInput instanceof HTMLInputElement) || !calendarGrid) {
            return;
        }

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const selectedDate = dateInput.value;
        const weekdays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
        let selectedDateAvailable = false;

        calendarGrid.replaceChildren();

        weekdays.forEach((weekday, index) => {
            const heading = document.createElement('span');
            heading.className = 'calendar-weekday';
            heading.textContent = weekday;
            heading.setAttribute('aria-label', ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][index]);
            calendarGrid.append(heading);
        });

        const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
        for (let index = 0; index < firstWeekday; index += 1) {
            const spacer = document.createElement('span');
            spacer.className = 'calendar-day-spacer';
            spacer.setAttribute('aria-hidden', 'true');
            calendarGrid.append(spacer);
        }

        const todayAtMidnight = new Date(year, month, today.getDate());
        const dateFormatter = new Intl.DateTimeFormat('es-MX', {
            weekday: 'long',
            day: 'numeric'
        });

        for (let day = 1; day <= daysInMonth; day += 1) {
            const date = new Date(year, month, day);
            const dateButton = document.createElement('button');
            dateButton.className = 'calendar-day';
            dateButton.type = 'button';
            dateButton.textContent = String(day);
            dateButton.setAttribute('aria-label', dateFormatter.format(date));

            const value = [
                year,
                String(month + 1).padStart(2, '0'),
                String(day).padStart(2, '0')
            ].join('-');

            dateButton.disabled = date < todayAtMidnight || date.getDay() === 1;
            selectedDateAvailable ||= value === selectedDate && !dateButton.disabled;
            dateButton.setAttribute('aria-pressed', String(value === selectedDate));
            dateButton.addEventListener('click', () => {
                dateInput.value = value;
                if (selectedDateLabel) {
                    selectedDateLabel.textContent = dateFormatter.format(date);
                }
                if (dateError) {
                    dateError.hidden = true;
                }
                dateTrigger.setAttribute('aria-expanded', 'false');
                calendar.hidden = true;
                updateAvailableBookingDates();
            });
            calendarGrid.append(dateButton);
        }

        if (!selectedDateAvailable && selectedDate) {
            dateInput.value = '';
            selectedDateLabel.textContent = 'Selecciona una fecha';
            calendarGrid.querySelectorAll('.calendar-day[aria-pressed="true"]').forEach((button) => {
                button.setAttribute('aria-pressed', 'false');
            });
        }
    };

    const createTimeSlots = () => {
        if (!(timeInput instanceof HTMLInputElement) || !timeSlots) {
            return;
        }

        for (let minutes = 10 * 60; minutes <= 18 * 60; minutes += 30) {
            const hour = Math.floor(minutes / 60);
            const minute = minutes % 60;
            const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            const button = document.createElement('button');
            button.className = 'time-slot';
            button.type = 'button';
            button.textContent = value;
            button.setAttribute('aria-pressed', String(value === timeInput.value));
            button.addEventListener('click', () => {
                timeInput.value = value;
                timeSlots.querySelectorAll('.time-slot').forEach((slot) => {
                    slot.setAttribute('aria-pressed', String(slot === button));
                });
                if (timeError) {
                    timeError.hidden = true;
                }
            });
            timeSlots.append(button);
        }
    };

    if (dateInput instanceof HTMLInputElement && dateTrigger && calendar) {
        updateAvailableBookingDates();
        dateTrigger.addEventListener('click', () => {
            calendar.hidden = !calendar.hidden;
            dateTrigger.setAttribute('aria-expanded', String(!calendar.hidden));
            if (!calendar.hidden) {
                updateAvailableBookingDates();
            }
        });

        document.addEventListener('click', (event) => {
            if (!calendar.hidden && !event.target.closest('.booking-picker')) {
                calendar.hidden = true;
                dateTrigger.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !calendar.hidden) {
                calendar.hidden = true;
                dateTrigger.setAttribute('aria-expanded', 'false');
                dateTrigger.focus();
            }
        });
    }

    if (timeInput instanceof HTMLInputElement) {
        createTimeSlots();
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        updateAvailableBookingDates();

        if (!form.reportValidity()) {
            return;
        }

        if (!dateInput.value) {
            dateError.hidden = false;
            dateTrigger.focus();
            return;
        }

        if (!timeInput.value) {
            timeError.hidden = false;
            timeSlots.querySelector('.time-slot').focus();
            return;
        }

        const nombre = form.querySelector('input[name="nombre"]').value.trim();
        const servicio = form.querySelector('select[name="servicio"]').value;
        const telefono = form.querySelector('input[name="telefono"]').value.trim() || 'No proporcionado';
        const fecha = dateInput.value;
        const [year, month, day] = fecha.split('-').map(Number);
        const fechaFormateada = new Intl.DateTimeFormat('es-MX', {
            weekday: 'long',
            day: 'numeric',
            timeZone: 'UTC'
        }).format(new Date(Date.UTC(year, month - 1, day)));
        const hora = timeInput.value;
        const mensaje = form.querySelector('textarea[name="mensaje"]').value.trim() || 'Sin notas adicionales';

        const whatsappUrl = `https://wa.me/522205427583?text=${encodeURIComponent(
            `Hola MTS Studio, quiero solicitar una cita.\n\nNombre: ${nombre}\nServicio: ${servicio}\nFecha preferida: ${fechaFormateada}\nHora preferida: ${hora}\nTeléfono de contacto: ${telefono}\nNotas: ${mensaje}\n\n¿Me pueden confirmar la disponibilidad?`
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
                dateInput.value = '';
                timeInput.value = '';
                selectedDateLabel.textContent = 'Selecciona una fecha';
                timeSlots.querySelectorAll('.time-slot').forEach((slot) => slot.setAttribute('aria-pressed', 'false'));
                dateError.hidden = true;
                timeError.hidden = true;
                calendar.hidden = true;
                dateTrigger.setAttribute('aria-expanded', 'false');
                updateAvailableBookingDates();
            }, 1800);
        }
    });
}

console.log('MTS Studio - Página cargada con estilos premium');