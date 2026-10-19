import React, { useState } from 'react';
import { Calendar, Clock, MessageSquare, AlertCircle, Info } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantInfo';
import { buildWhatsAppReservationMessage } from '../utils/pricing';

interface ReservationsSectionProps {
  onGoToHome?: () => void;
  onGoToMenu?: () => void;
}

export const ReservationsSection: React.FC<ReservationsSectionProps> = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('21:00');
  const [guests, setGuests] = useState(2);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Por favor, indica tu nombre completo para la reserva.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 8) {
      setErrorMessage('Por favor, introduce un teléfono de contacto válido.');
      return;
    }
    if (!date) {
      setErrorMessage('Por favor, selecciona una fecha para tu reserva.');
      return;
    }

    const message = buildWhatsAppReservationMessage({
      name: name.trim(),
      phone: phone.trim(),
      date,
      time,
      guests,
      notes: notes.trim() || undefined,
    });

    const encoded = encodeURIComponent(message);
    // WhatsApp link with clean number without spaces or punctuation
    const whatsappUrl = `https://wa.me/34${RESTAURANT_INFO.phone.clean}?text=${encoded}`;
    window.location.href = whatsappUrl;
  };

  return (
    <section className="py-16 sm:py-24 bg-transparent relative min-h-[75vh] flex items-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="embossed-card rounded-2xl sm:rounded-3xl p-6 sm:p-12 relative overflow-hidden">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h1 className="font-display text-3xl sm:text-5xl font-bold uppercase tracking-tight text-white embossed-text-3d">
              RESERVA TU MESA
            </h1>
          </div>

          {/* Mandatory Reservation Notice */}
          <div className="mb-8 p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs sm:text-sm text-amber-200 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold mb-0.5">Aviso importante sobre tu reserva:</strong>
              <span>Tu solicitud de reserva deberá ser confirmada por el restaurante. Abrir WhatsApp no envía el mensaje de forma automática; revísalo y pulsa enviar.</span>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-lg bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label htmlFor="res-name" className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                  Nombre completo *
                </label>
                <input
                  id="res-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej.: Rafael Guillén"
                  className="w-full px-4 py-3 bg-[#0d0d12] border border-[#272738] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
                />
              </div>

              {/* Telephone */}
              <div>
                <label htmlFor="res-phone" className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                  Teléfono de contacto *
                </label>
                <input
                  id="res-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Tu teléfono móvil"
                  className="w-full px-4 py-3 bg-[#0d0d12] border border-[#272738] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
                />
              </div>

              {/* Date */}
              <div>
                <label htmlFor="res-date" className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                  Fecha deseada *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="res-date"
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#0d0d12] border border-[#272738] rounded-xl text-sm text-white focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {/* Preferred Time */}
              <div>
                <label htmlFor="res-time" className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                  Hora preferida *
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    id="res-time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#0d0d12] border border-[#272738] rounded-xl text-sm text-white focus:outline-none focus:border-red-600"
                  >
                    <optgroup label="Comidas (Miércoles a Domingo)">
                      <option value="13:30">13:30</option>
                      <option value="14:00">14:00</option>
                      <option value="14:30">14:30</option>
                      <option value="15:00">15:00</option>
                      <option value="15:30">15:30</option>
                    </optgroup>
                    <optgroup label="Cenas (Martes a Domingo)">
                      <option value="20:30">20:30</option>
                      <option value="21:00">21:00</option>
                      <option value="21:30">21:30</option>
                      <option value="22:00">22:00</option>
                      <option value="22:30">22:30</option>
                      <option value="23:00">23:00</option>
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>

            {/* Number of People */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Número de personas ({guests})
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((num) => {
                  const isSelected = guests === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setGuests(num)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors border cursor-pointer ${
                        isSelected
                          ? 'bg-red-600 border-red-600 text-white'
                          : 'bg-[#181822] border-[#29293a] text-zinc-400 hover:text-white'
                      }`}
                    >
                      {num} {num === 1 ? 'persona' : 'personas'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Comments */}
            <div>
              <label htmlFor="res-notes" className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                Comentarios opcionales (alergias, trona, preferencias)
              </label>
              <textarea
                id="res-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Indícanos cualquier petición especial..."
                className="w-full px-4 py-3 bg-[#0d0d12] border border-[#272738] rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-600"
              />
            </div>

            {/* Protección de Datos (RGPD / LOPDGDD - Primera Capa Informativa) */}
            <div className="p-3.5 rounded-xl bg-[#13131c] border border-white/5 text-[11px] text-zinc-400 space-y-2">
              <div className="text-zinc-300 font-semibold text-xs">
                Información básica de protección de datos (RGPD / LOPDGDD):
              </div>
              <p className="leading-relaxed">
                <strong>Responsable:</strong> La Tentación Burger · <strong>Finalidad:</strong> Tramitar y confirmar su solicitud de reserva de mesa · <strong>Legitimación:</strong> Ejecución de medidas precontractuales solicitadas por el interesado (art. 6.1.b RGPD) · <strong>Destinatarios:</strong> Datos canalizados hacia el establecimiento vía WhatsApp sin cesión a otros terceros salvo imperativo legal · <strong>Derechos:</strong> Acceso, rectificación y supresión solicitándolo en el local o vía telefónica ({RESTAURANT_INFO.phone.display}).
              </p>
              <label className="flex items-start gap-2 pt-1 text-zinc-200 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 rounded border-[#2b2b3d] text-red-600 focus:ring-red-600 shrink-0"
                />
                <span className="text-[11px]">
                  He leído y acepto el tratamiento de mis datos de contacto para la gestión de la reserva conforme a la Política de Privacidad. *
                </span>
              </label>
            </div>

            {/* Submit Action */}
            <div className="pt-2 text-center">
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold uppercase tracking-wider text-xs sm:text-sm rounded-xl shadow-xl shadow-emerald-950/50 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <MessageSquare className="w-5 h-5" />
                <span>SOLICITAR RESERVA POR WHATSAPP</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
