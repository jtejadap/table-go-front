import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Chatbot } from './chatbot';

describe('Chatbot', () => {
  let component: Chatbot;
  let fixture: ComponentFixture<Chatbot>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chatbot],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Chatbot);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('envía el mensaje con su historial y muestra la respuesta', () => {
    component.enviar('Hola');
    const req = http.expectOne('/api/chat');
    expect(req.request.body).toEqual({ message: 'Hola', history: [] });
    req.flush({ reply: '¡Hola!', mensajesRestantes: 29 });

    expect(component.mensajes()).toEqual([
      { role: 'user', content: 'Hola' },
      { role: 'assistant', content: '¡Hola!' },
    ]);
    expect(component.restantes()).toBe(29);
  });

  it('muestra el mensaje del back cuando se supera el límite (429)', () => {
    component.enviar('Hola');
    http.expectOne('/api/chat').flush({ message: 'Límite alcanzado' }, { status: 429, statusText: 'Too Many Requests' });
    expect(component.error()).toBe('Límite alcanzado');
    expect(component.enviando()).toBe(false);
  });
});
