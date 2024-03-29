import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.css'],
})
export class ResetComponent implements OnInit {
  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private httpClient: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.formBuilder.group({
      password: '',
    });
  }

  ngOnInit(): void {}

  submit(): void {
    const formData = this.form.getRawValue();
    const data = {
      password: formData.password,
      token: this.route.snapshot.params['token'],
    };
    this.httpClient
      .post('http://localhost:3000/api/reset', data)
      .subscribe(() => this.router.navigate(['/login']));
  }
}
