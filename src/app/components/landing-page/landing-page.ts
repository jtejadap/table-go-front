import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPage {
  readonly anioActual = new Date().getFullYear();

  readonly funcionalidades = [
    {
      icono: '🔎',
      titulo: 'Descubre restaurantes',
      descripcion:
        'Busca por nombre o ciudad y encuentra los mejores lugares cerca de ti usando tu ubicación y un radio de búsqueda en kilómetros.',
    },
    {
      icono: '📅',
      titulo: 'Reserva en segundos',
      descripcion:
        'Elige fecha, hora y número de comensales. Tu mesa queda apartada al instante, sin llamadas ni esperas.',
    },
    {
      icono: '🍽️',
      titulo: 'Arma tu pedido',
      descripcion:
        'Explora el menú del restaurante y añade tus platos favoritos a la reserva. Ajusta tu pedido cuando quieras antes de llegar.',
    },
    {
      icono: '🔔',
      titulo: 'Gestiona tus reservas',
      descripcion:
        'Consulta tu historial, filtra por estado o fecha y cancela fácilmente desde tu panel de cliente.',
    },
    {
      icono: '🏪',
      titulo: 'Panel para restaurantes',
      descripcion:
        'Los administradores administran su restaurante, menú, categorías y disponibilidad de platos desde un solo lugar.',
    },
    {
      icono: '🛡️',
      titulo: 'Seguro y confiable',
      descripcion:
        'Accesos diferenciados para clientes y administradores, con información de reservas protegida en todo momento.',
    },
  ];

  readonly pasos = [
    {
      numero: '1',
      titulo: 'Crea tu cuenta',
      descripcion: 'Regístrate como cliente y accede a tu panel personal.',
    },
    {
      numero: '2',
      titulo: 'Encuentra tu mesa',
      descripcion: 'Filtra restaurantes por ciudad, cercanía o nombre.',
    },
    {
      numero: '3',
      titulo: 'Reserva y pide',
      descripcion: 'Confirma tu reserva y arma tu pedido anticipado.',
    },
    {
      numero: '4',
      titulo: '¡Solo llega y disfruta!',
      descripcion: 'Tu mesa y tu pedido están listos para ti.',
    },
  ];
}
