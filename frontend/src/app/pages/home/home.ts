import { Component } from '@angular/core';
import { Slider } from '../../components/slider/slider';
import { UserCard } from '../../components/user-card/user-card';

@Component({
  selector: 'app-home',
  imports: [Slider,UserCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
