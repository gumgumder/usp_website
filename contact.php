<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');

function respond(int $status, bool $success, string $message): void
{
    http_response_code($status);
    echo json_encode(
        ['success' => $success, 'message' => $message],
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, false, 'Diese Anfrage ist nicht erlaubt.');
}

// Das versteckte Feld wird normalerweise nur von Bots ausgefüllt.
if (trim((string) ($_POST['website'] ?? '')) !== '') {
    respond(200, true, 'Vielen Dank. Ihre Anfrage wurde gesendet.');
}

$name = trim((string) ($_POST['name'] ?? ''));
$company = trim((string) ($_POST['company'] ?? ''));
$phone = trim((string) ($_POST['phone'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));

if ($name === '' || $company === '' || $phone === '' || $email === '') {
    respond(422, false, 'Bitte füllen Sie alle Felder aus.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(422, false, 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
}

foreach ([$name, $company, $phone, $email] as $value) {
    if (preg_match('/[\r\n]/', $value) === 1) {
        respond(422, false, 'Die eingegebenen Daten sind ungültig.');
    }
}

if (
    strlen($name) > 240 ||
    strlen($company) > 320 ||
    strlen($phone) > 120 ||
    strlen($email) > 254
) {
    respond(422, false, 'Eine Eingabe ist zu lang.');
}

$recipient = 'hallo@usp-bote.at';
$subject = 'Neue Demo-Anfrage über usp-bote.at';
$body = implode("\r\n", [
    'Neue Anfrage über das Kontaktformular:',
    '',
    'Name: ' . $name,
    'Firma: ' . $company,
    'Telefon: ' . $phone,
    'E-Mail: ' . $email,
    '',
    'Die Person interessiert sich für eine Demo von USP-Bote.',
]);

$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$headers = implode("\r\n", [
    'From: USP-Bote Website <hallo@usp-bote.at>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
]);

if (!mail($recipient, $encodedSubject, $body, $headers)) {
    respond(500, false, 'Die Anfrage konnte gerade nicht gesendet werden. Bitte versuchen Sie es später erneut.');
}

respond(200, true, 'Vielen Dank. Ihre Anfrage wurde erfolgreich gesendet.');
