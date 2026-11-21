import { Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ChatMessage, ChatService } from '../../services/chat-service';

const MAX_CARACTERES = 500; // mismo límite que valida el back
const MAX_HISTORIAL = 10;   // mensajes previos que se reenvían como contexto

@Component({
  imports: [FormsModule],
  selector: 'app-chatbot',
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.css',
})
export class Chatbot {
  private chat = inject(ChatService);
  private scroller = viewChild<ElementRef<HTMLElement>>('scroller');

  readonly maxCaracteres = MAX_CARACTERES;
  readonly sugerencias = [
    'Busca restaurantes en Cartagena',
    '¿Qué restaurantes de pizza hay?',
    'Quiero reservar una mesa para mañana',
  ];

  /** Conversación visible. La API no guarda estado: el historial se reenvía en cada mensaje. */
  mensajes = signal<ChatMessage[]>([]);
  texto = signal('');
  enviando = signal(false);
  restantes = signal<number | null>(null);
  error = signal<string | null>(null);

  constructor() {
    // Baja el scroll al último mensaje cada vez que cambia la conversación
    effect(() => {
      this.mensajes();
      this.enviando();
      queueMicrotask(() => {
        const el = this.scroller()?.nativeElement;
        if (el) el.scrollTop = el.scrollHeight;
      });
    });
  }

  enviar(textoSugerido?: string) {
    const mensaje = (textoSugerido ?? this.texto()).trim();
    if (!mensaje || mensaje.length > MAX_CARACTERES || this.enviando()) return;

    const historial = this.mensajes().slice(-MAX_HISTORIAL);
    this.mensajes.update(m => [...m, { role: 'user', content: mensaje }]);
    this.texto.set('');
    this.error.set(null);
    this.enviando.set(true);

    this.chat.enviar({ message: mensaje, history: historial }).subscribe({
      next: res => {
        this.mensajes.update(m => [...m, { role: 'assistant', content: res.reply }]);
        this.restantes.set(res.mensajesRestantes);
        this.enviando.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.error.set(this.mensajeDeError(e));
        this.enviando.set(false);
      },
    });
  }

  /** Enter envía; Shift+Enter hace salto de línea. */
  onEnter(ev: Event) {
    if ((ev as KeyboardEvent).shiftKey) return;
    ev.preventDefault();
    this.enviar();
  }

  nuevaConversacion() {
    this.mensajes.set([]);
    this.error.set(null);
  }

  private mensajeDeError(e: HttpErrorResponse): string {
    // El back responde con { message } (ApiError) en 429 y 503
    const detalle = e.error?.message as string | undefined;
    switch (e.status) {
      case 429: return detalle ?? 'Alcanzaste el límite de mensajes. Intenta más tarde.';
      case 503: return detalle ?? 'El asistente no está disponible por ahora.';
      case 403: return 'El asistente solo está disponible para clientes.';
      case 0:   return 'No hay conexión con el servidor.';
      default:  return 'No pudimos responder tu mensaje. Intenta de nuevo.';
    }
  }
}
