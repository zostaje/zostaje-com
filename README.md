# zostaje.com

Statyczna strona produktowa aplikacji Zostaje.

## Lokalny podgląd

```bash
python3 -m http.server 8080
```

Następnie otwórz `http://localhost:8080`.

## Pliki

- `index.html` — treść i semantyczna struktura strony,
- `styles.css` — responsywny wygląd bez zewnętrznych zależności,
- `BRAND.md` — skrócony przewodnik po kolorach, typografii i stylu marki.

Formularz demo korzysta obecnie z `mailto:`. Po uruchomieniu backendu należy podmienić jego
`action` na właściwy endpoint zapisujący zgodę i adres e-mail.
