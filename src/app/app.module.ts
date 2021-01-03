import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { EngineComponent } from "./engine/engine.component";
import { UiInfobarBottomComponent } from "./ui/ui-infobar-bottom/ui-infobar-bottom.component";
import { UiComponent } from "./ui/ui.component";

@NgModule({
  declarations: [
    AppComponent,
    EngineComponent,
    UiComponent,
    UiInfobarBottomComponent,
  ],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
