---
title: Antlr Token (Marble Internal)
publish: true
tags:
  - ifs-other-models
  - ifs-other-models/confirmed
aliases:
  - antlrtoken
  - AntlrToken
related: []
---

# Antlr Token (Marble Internal)

> [!warning] This is not an IFS Cloud development construct
> Despite showing up in Marble's 47-language index, `AntlrToken` is not something you write in a `.client`, `.projection`, or any other IFS Cloud source file. It's part of **Marble's own internal meta-grammar** — the notation Marble uses to define the token placeholders (`$String`, `$Identifier`, `$AnyChar`, etc.) that appear inside the EBNF of *every other* language documented in this vault. It was investigated on a hunch that it related to a "repeating section" pattern seen in `.client` files — it doesn't. If you're looking for that, it belongs in `Marble Language Reference/Client`, not here.

## Why It's Named "AntlrToken"

[ANTLR](https://www.antlr.org/) ("ANother Tool for Language Recognition") is a well-known parser/lexer generator. Its lexer rules use a small, recognizable vocabulary: literal text, character classes, ranges, optional groups (`?`), repetition (`+`/`*`), non-greedy repetition (`*?`), negation (`~`), alternation (`|`), and fragment references to other lexer rules. Every one of the 16 files in this directory maps directly onto one of those concepts — confirming that's exactly what this is.

## Full Grammar (all 16 files — every `Keyword` is `"null"`, no Description/Explanation exists for any of them)

| Construct | EBNF | ANTLR equivalent |
|-----------|------|--------------------|
| `ItemList` | `( AnyCharsItem \| AnyCharsComplexItem \| AnyCharItem \| FragmentItem \| FixedTextItem \| RangeItem \| EnclosedItem \| NotEnclosedItem \| OptionalItem \| RepeatingItem \| OptionalRepeatingItem \| LimitRepeatingItem \| UntilRepeatingItem \| NotRepeatingItem )+` | A sequence of one or more pattern items — the body of a token rule. |
| `FixedTextItem` | `$String` | A literal text fragment. |
| `AnyCharItem` | `$AnyChar` | Matches any single character (like `.` in regex). |
| `AnyCharsItem` | `$AnyChars` `$String` | Matches any characters up to a literal string. |
| `AnyCharsComplexItem` | `$AnyChars` `EnclosedItem` | Matches any characters up to a more complex (grouped) pattern. |
| `RangeItem` | `$String` `$Range` `$String` | A character range, e.g. `'a'..'z'`. |
| `FragmentItem` | `$Identifier` | A reference to another named token/fragment rule. |
| `EnclosedItem` | `"(" ItemList ( MultichoiceItem )* ")"` | A parenthesized group, optionally with alternation — `(...)` / `(...\|...)`. |
| `NotEnclosedItem` | `"~" "(" ItemList ( MultichoiceItem )* ")"` | A negated group — `~(...)`. |
| `OptionalItem` | `"(" ItemList ( MultichoiceItem )* ")?"` | Optional group — `(...)?`. |
| `RepeatingItem` | `"(" ItemList ( MultichoiceItem )* ")+"` | One-or-more — `(...)+`. |
| `OptionalRepeatingItem` | `"(" ItemList ( MultichoiceItem )* ")*"` | Zero-or-more — `(...)*`. |
| `NotRepeatingItem` | `"~" "(" ItemList ( MultichoiceItem )* ")*"` | Negated zero-or-more — `~(...)*`. |
| `LimitRepeatingItem` | `"~" "(" ItemList ( MultichoiceItem )* ")*?" ( $String \| $Identifier )` | Non-greedy repetition up to a terminator — `~(...)*?` followed by a stop token. |
| `UntilRepeatingItem` | `"(" ItemList ( MultichoiceItem )* ")*?" ( $String \| $Identifier )` | Same non-greedy "repeat until" pattern, without the leading negation. |
| `MultichoiceItem` | `"\|" ItemList` | The alternation operator inside a group. |

> [!tip] A likely copy-paste artifact
> `OptionalRepeatingItem` and `NotRepeatingItem` both produce the literal token `")*"` in their EBNF — `NotRepeatingItem` additionally has the leading `"~"` `"("`, so they're not identical, but it's worth noting as a possible inconsistency in Marble's own grammar source, in the same spirit as the `CodeRegistrationBefore`/`CodeRegistrationAfter` naming mismatch found in [[Cross Edition Trigger (Base Server)]].

## Why This Matters (or Doesn't) For Your Work

It doesn't — directly. You'll never write `AntlrToken` syntax in an IFS Cloud file. The reason it's worth having a note at all is so this vault has an answer the next time something like `$String`/`$Identifier`/`$AnyChar` shows up unexplained in another language's EBNF (which it does, constantly, throughout this vault) — now there's a place that says what those placeholder tokens actually are and where their own definition mechanism lives.

## See Also

- [[Cross Edition Trigger (Base Server)]] — where a similar grammar-source inconsistency was noted
- `Marble Language Reference/Client` — if you're looking for the actual `.client` repeating-section construct, it lives there, not here
