import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NlpComponent } from "./nlp.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NlpComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  ngOnInit(): void {

    console.log('App initialized');

  }
  protected title = 'NLPUI';
}
