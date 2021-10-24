import {
	App,
	TFile,
	Editor,
	EditorPosition,
	EditorSuggest,
	EditorSuggestTriggerInfo,
	EditorSuggestContext
} from 'obsidian';

import {
	cursorTag,
	matchingTag,
	isOpeningTag
} from './common';


export default class HtmlTagsAutocompleteSuggestor extends EditorSuggest<string> {

	constructor( app: App ) {
		super( app );
	}

	onTrigger( cursor: EditorPosition, editor: Editor, file: TFile ): EditorSuggestTriggerInfo | null {
		if ( cursor.ch === 0 ) {
			// at beginning of line,
			// can't be in a tag
			return null;
		}

		const cursor_tag = cursorTag( cursor, editor );
		if ( !cursor_tag ) {
			return null;
		}

		const pair_tag = matchingTag( cursor_tag );
		if ( !pair_tag && isOpeningTag( cursor_tag ) ) {
			// opening tag without matching close
			return {
				start: { line: cursor.line, ch: cursor_tag.index },
				end: { line: cursor.line, ch: cursor_tag.index + cursor_tag[ 0 ].length },
				query: `</${cursor_tag[ 2 ]}>`
			};
		}

		return null;
	}

	getSuggestions( context: EditorSuggestContext ): string[] | Promise<string[]> {
		return [ `${context.query}` ];
	}

	renderSuggestion( value: string, el: HTMLElement ) {
		const suggestion = document.createElement( 'p' );
		suggestion.innerText = value;

		el.appendChild( suggestion  );
	}

	selectSuggestion( value: string, event: MouseEvent | KeyboardEvent ) {
		const editor = this.context.editor;
		const cursor = editor.getCursor();
		const cursor_tag = cursorTag( cursor, editor );
		if ( !cursor_tag ) {
			// error
			return false;
		}

		const insert_pos = {
			line: cursor.line,
			ch: cursor_tag.index + cursor_tag[ 0 ].length
		};

		editor.replaceRange( value, insert_pos );
		editor.setSelection( insert_pos );  // place cursor between tags
	}
}