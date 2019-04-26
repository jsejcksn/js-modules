function isStringNumber (str) {
  if (str.trim() !== '' && Number(str) === Number(str)) {
    return true;
  }
  else return false;
}
