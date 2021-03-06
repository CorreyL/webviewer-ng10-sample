import { Component, ViewChild, OnInit, Output, EventEmitter, ElementRef, AfterViewInit } from '@angular/core';
import { Subject } from 'rxjs';
import WebViewer, { WebViewerInstance } from '@pdftron/webviewer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  // @ts-ignore
  @ViewChild('viewer') viewer: ElementRef;
  @Output() coreControlsEvent: EventEmitter<string> = new EventEmitter();

  private wvInstance: WebViewerInstance | null;
  private documentLoaded$: Subject<void>;

  constructor() {
    this.documentLoaded$ = new Subject<void>();
    this.wvInstance = null;
  }

  ngAfterViewInit(): void {
    WebViewer(
      {
        path: '../lib',
        initialDoc: 'https://pdftron.s3.amazonaws.com/downloads/pl/demo-annotated.pdf',
      },
      this.viewer.nativeElement
    ).then(instance => {
      this.wvInstance = instance;

      this.coreControlsEvent.emit(instance.UI.LayoutMode.Single);

      const { documentViewer, Annotations, annotationManager } = instance.Core;

      instance.UI.openElements(['notesPanel']);

      documentViewer.addEventListener('annotationsLoaded', () => {
        console.log('annotations loaded');
      });

      documentViewer.addEventListener('documentLoaded', () => {
        this.documentLoaded$.next();
        const rectangleAnnot = new Annotations.RectangleAnnotation({
          PageNumber: 1,
          // values are in page coordinates with (0, 0) in the top left
          X: 100,
          Y: 150,
          Width: 200,
          Height: 50,
          Author: annotationManager.getCurrentUser()
        });
        annotationManager.addAnnotation(rectangleAnnot);
        annotationManager.redrawAnnotation(rectangleAnnot);
      });
    });
  }

  ngOnInit() {}

  getDocumentLoadedObservable() {
    return this.documentLoaded$.asObservable();
  }
}
