import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TextCompletionResponse, ModelInfo, TextCompletionRequest, ChatResponse } from './models/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NlpService } from './nlp.service';
import { finalize } from 'rxjs/operators';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-nlp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nlp.component.html',
  styleUrls: ['./nlp.component.css'] // corrected property name
})
export class NlpComponent implements OnInit {
  // Form fields
  question: string = '';
  safeHtml: SafeHtml | null = null;


  context: string = '';
  selectedModel: string = 'google/gemma-2-9b-it';
  maxTokens: number = 500;
  temperature: number = 0.7;

  // State
  isLoading: boolean = false;
  errorMessage: string = '';
  response: ChatResponse | null = null;
  availableModels: ModelInfo[] = [];

  // UI helpers
  showAdvancedOptions: boolean = false;


  constructor(private completionService: NlpService,private sanitizer: DomSanitizer,private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadAvailableModels();
  }

  /**
   * Load available models from API
   */
  loadAvailableModels(): void {
    this.completionService.getModels().subscribe({
      next: (response) => {
        this.availableModels = response.models;
        console.log('Available models loaded:', this.availableModels);
      },
      error: (error) => {
        console.error('Error loading models:', error);
        // Set default models if API fails
        this.availableModels = [
          { id: 'google/gemma-2-9b-it', name: 'Google Gemma 2 9B', provider: 'Hugging Face' },
          { id: 'deepset/roberta-base-squad2', name: 'RoBERTa SQuAD2', provider: 'Hugging Face' },
          { id: 'gpt2', name: 'GPT-2', provider: 'Hugging Face' }
        ];
      }
    });
  }

  /**
   * Submit completion request
   */
  onSubmit(): void {
    // Validate input
    if (!this.question.trim()) {
      this.errorMessage = 'Please enter a question';
      return;
    }

    // Reset state
    this.isLoading = true;
    this.errorMessage = '';
    this.response = null;

    // Build request
    const request: TextCompletionRequest = {
      prompt: this.question.trim(),
      //context: this.context.trim() || undefined,
      model: this.selectedModel,
      //maxTokens: this.maxTokens,
      //temperature: this.temperature
    };

    console.log('Submitting request:', request);

    // Call API and ensure loader is cleared on completion or error
    this.completionService.complete(request)
      .pipe(
        finalize(() => {
          // Always clear loader when observable completes/errors
          this.isLoading = false;
        })
      )
      .subscribe({
next: (response: ChatResponse) => {
  this.response = response;

  // Safely render model's HTML output
  const rawHtml = response.choices?.[0]?.message.content || '';
  const cleanedHtml = this.cleanHtml(rawHtml);
  this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(cleanedHtml);

  this.isLoading = false;
  this.cdr.detectChanges(); // ensure UI updates immediately
},
        error: (error) => {
          console.error('Completion error:', error);
          this.errorMessage = error?.message || 'An error occurred while processing your request.';
        }
      });
  }

  /**
   * Clear form and results
   */
  onClear(): void {
    this.question = '';
    this.context = '';
    this.response = null;
    this.errorMessage = '';
  }
  private cleanHtml(content: string): string {
  return content.replace(/<script.*?>.*?<\/script>/gi, '');
}
private sanitizeContent(content: string): string {
  return content.replace(/<script.*?>.*?<\/script>/gi, '');
}
  /**
   * Toggle advanced options
   */
  toggleAdvancedOptions(): void {
    this.showAdvancedOptions = !this.showAdvancedOptions;
  }

  /**
   * Copy answer to clipboard
   */
  copyAnswer(): void {
    if (this.response && this.response.choices.length > 0) {
      const answer = this.response.choices[0].message.content;
      navigator.clipboard.writeText(answer).then(() => {
        console.log('Answer copied to clipboard');
        // You could show a toast notification here
      });
    }
  }

  /**
   * Format timestamp for display
   * Handles both seconds and milliseconds timestamps
   */
  formatTimestamp(timestamp: number): string {
    if (!timestamp) {
      return '';
    }
    // If timestamp looks like milliseconds (>= 1e12) use as-is, otherwise treat as seconds.
    const tsMs = timestamp > 1e12 ? timestamp : timestamp * 1000;
    return new Date(tsMs).toLocaleString();
  }

  /**
   * Get model display name
   */
  getModelDisplayName(modelId: string): string {
    const model = this.availableModels.find(m => m.id === modelId);
    return model ? model.name : modelId;
  }
  getAnswer(): string {
  return this.response?.choices?.[0]?.message.content ?? '';
}

getFinishReason(): string {
  return this.response?.choices?.[0]?.finish_reason ?? '';
}

getTimestamp(): string {
  return this.formatTimestamp(this.response?.created ?? 0);
}

getModelName(): string {
  return this.response?.model ?? '';
}

getTokenUsage(): string {
  if (!this.response?.usage) return '';
  const { prompt_tokens, completion_tokens, total_tokens } = this.response.usage;
  return `Prompt: ${prompt_tokens}, Completion: ${completion_tokens}, Total: ${total_tokens}`;
}
}
