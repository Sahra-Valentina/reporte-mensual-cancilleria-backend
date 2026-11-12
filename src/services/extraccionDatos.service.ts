export interface DatosExtraidos {
  nombre_completo: string;
  tipo_documento: string;
  numero_documento: string;
  correo_electronico: string;
  numero_telefono: string;
  acepta_politica: string;
}

interface Turno {
  emisor: "cliente" | "bot";
  mensaje: string;
}

const NO_INFORMADO = "No informado";

const limpiarTexto = (texto: string): string => {
  return texto
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const normalizarTexto = (texto: string): string => {
  return limpiarTexto(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const separarTurnos = (conversacion: string): Turno[] => {
  const patron = /(Cliente|Bot)\s*:\s*/gi;
  const coincidencias = [...conversacion.matchAll(patron)];

  const turnos: Turno[] = [];

  coincidencias.forEach((coincidencia, indice) => {
    const inicio = coincidencia.index! + coincidencia[0].length;

    const siguiente = coincidencias[indice + 1];
    const fin = siguiente?.index ?? conversacion.length;

    const mensaje = limpiarTexto(conversacion.slice(inicio, fin));

    if (mensaje) {
      turnos.push({
        emisor: coincidencia[1].toLowerCase() === "cliente" ? "cliente" : "bot",
        mensaje,
      });
    }
  });

  return turnos;
};

const obtenerRespuestas = (
  turnos: Turno[],
  pregunta: RegExp,
): { pregunta: string; respuesta: string }[] => {
  const resultados: {
    pregunta: string;
    respuesta: string;
  }[] = [];

  for (let i = 0; i < turnos.length - 1; i++) {
    const turnoBot = turnos[i];
    const siguienteTurno = turnos[i + 1];

    if (
      turnoBot.emisor === "bot" &&
      pregunta.test(turnoBot.mensaje) &&
      siguienteTurno.emisor === "cliente"
    ) {
      resultados.push({
        pregunta: turnoBot.mensaje,
        respuesta: siguienteTurno.mensaje,
      });
    }
  }

  return resultados;
};

const extraerNombre = (respuestas: string[]): string => {
  for (const respuestaOriginal of [...respuestas].reverse()) {
    let respuesta = limpiarTexto(respuestaOriginal);

    respuesta = respuesta
      .replace(/^(mi nombre es|me llamo)\s+/i, "")
      .replace(/[.,;]+$/g, "")
      .trim();

    const normalizada = normalizarTexto(respuesta);

    if (
      /^(hola|si|no|acepto|ok|okay|buenos dias|buenas tardes)$/i.test(
        normalizada,
      )
    ) {
      continue;
    }

    const nombreValido =
      /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'’-]+(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'’-]+){1,7}$/.test(
        respuesta,
      );

    if (nombreValido) {
      return respuesta
        .toLocaleLowerCase("es-CO")
        .replace(/(^|\s)[a-záéíóúüñ]/g, (letra) =>
          letra.toLocaleUpperCase("es-CO"),
        );
    }
  }

  return NO_INFORMADO;
};

const extraerTipoDocumento = (respuestas: string[]): string => {
  for (const respuesta of [...respuestas].reverse()) {
    const valor = normalizarTexto(respuesta)
      .replace(/[.,;:]/g, " ")
      .trim();

    if (
      /^1(?:\D|$)/.test(valor) ||
      /\b(cc|c\.c)\b/.test(valor) ||
      /\bcedula de ciudadania\b/.test(valor) ||
      /^cedula$/.test(valor)
    ) {
      return "Cédula de ciudadanía";
    }

    if (
      /^2(?:\D|$)/.test(valor) ||
      /\b(ce|c\.e)\b/.test(valor) ||
      /\bcedula de extranjeria\b/.test(valor)
    ) {
      return "Cédula de extranjería";
    }

    if (
      /^3(?:\D|$)/.test(valor) ||
      /\b(ti|t\.i)\b/.test(valor) ||
      /\btarjeta de identidad\b/.test(valor)
    ) {
      return "Tarjeta de identidad";
    }

    if (
      /^4(?:\D|$)/.test(valor) ||
      /\botro\b/.test(valor) ||
      /\bpasaporte\b/.test(valor)
    ) {
      return "Otro";
    }
  }

  return NO_INFORMADO;
};

const extraerNumeroDocumento = (respuestas: string[]): string => {
  for (const respuesta of [...respuestas].reverse()) {
    const numeros = respuesta.match(/\d{5,15}/g);

    if (numeros?.length) {
      return numeros.sort((a, b) => b.length - a.length)[0];
    }

    const candidatos = respuesta.match(/\b[A-Za-z0-9-]{5,20}\b/g);

    if (candidatos) {
      const valido = candidatos.find(
        (valor) => /\d/.test(valor) && /^[A-Za-z0-9-]+$/.test(valor),
      );

      if (valido) {
        return valido;
      }
    }
  }

  return NO_INFORMADO;
};

const extraerCorreo = (respuestas: string[]): string => {
  for (const respuesta of [...respuestas].reverse()) {
    const correo = respuesta.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);

    if (correo) {
      return correo[0].toLowerCase();
    }
  }

  return NO_INFORMADO;
};

const extraerTelefono = (respuestas: string[]): string => {
  for (const respuesta of [...respuestas].reverse()) {
    const candidatos = respuesta.match(/\+?\s*\d[\d\s().-]{5,25}\d/g);

    if (!candidatos) {
      continue;
    }

    for (const candidato of candidatos) {
      const digitos = candidato.replace(/\D/g, "");

      if (digitos.length >= 7 && digitos.length <= 15) {
        return candidato.trim().startsWith("+") ? `+${digitos}` : digitos;
      }
    }
  }

  return NO_INFORMADO;
};

const extraerAceptacion = (
  respuestas: { pregunta: string; respuesta: string }[],
): string => {
  for (const registro of [...respuestas].reverse()) {
    const respuesta = normalizarTexto(registro.respuesta)
      .replace(/[.!¡¿?;,]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const pregunta = normalizarTexto(registro.pregunta);

    const esPreguntaPolitica =
      /acepta.{0,150}(uso|tratamiento|datos personales)|datos personales.{0,150}acepta/.test(
        pregunta,
      );

    if (!esPreguntaPolitica) {
      continue;
    }

    const respuestasNegativas = [
      /^no$/,
      /^no acepto$/,
      /^no autorizo$/,
      /^no estoy de acuerdo$/,
      /^no deseo$/,
      /^no quiero$/,
      /^rechazo$/,
      /^negativo$/,
      /^claro que no$/,
      /^por supuesto que no$/,
    ];

    if (respuestasNegativas.some((patron) => patron.test(respuesta))) {
      return "No";
    }

    const respuestasAfirmativas = [
      /^si$/,
      /^acepto$/,
      /^autorizo$/,
      /^estoy de acuerdo$/,
      /^de acuerdo$/,
      /^claro$/,
      /^claro que si$/,
      /^por supuesto$/,
      /^por supuesto que si$/,
      /^correcto$/,
      /^afirmativo$/,
      /^vale$/,
      /^bueno$/,
      /^ok$/,
      /^okay$/,
    ];

    if (respuestasAfirmativas.some((patron) => patron.test(respuesta))) {
      return "Sí";
    }

    if (/^1$/.test(respuesta)) {
      if (/1.{0,30}(si|acepto|autorizo)/.test(pregunta)) {
        return "Sí";
      }

      if (/1.{0,30}no\b/.test(pregunta)) {
        return "No";
      }
    }

    if (/^2$/.test(respuesta)) {
      if (/2.{0,30}(si|acepto|autorizo)/.test(pregunta)) {
        return "Sí";
      }

      if (/2.{0,30}no\b/.test(pregunta)) {
        return "No";
      }
    }
  }

  return NO_INFORMADO;
};

export const extraerDatosConversacion = (
  conversacion: string | null,
): DatosExtraidos => {
  const resultado: DatosExtraidos = {
    nombre_completo: NO_INFORMADO,
    tipo_documento: NO_INFORMADO,
    numero_documento: NO_INFORMADO,
    correo_electronico: NO_INFORMADO,
    numero_telefono: NO_INFORMADO,
    acepta_politica: NO_INFORMADO,
  };

  if (!conversacion) {
    return resultado;
  }

  const turnos = separarTurnos(conversacion);

  const respuestasNombre = obtenerRespuestas(
    turnos,
    /nombre completo|indique su nombre/i,
  );

  const respuestasTipo = obtenerRespuestas(
    turnos,
    /tipo de documento|tipo de identificacion/i,
  );

  const respuestasDocumento = obtenerRespuestas(
    turnos,
    /n[uú]mero\s+de\s+documento|documento\s+de\s+identidad|n[uú]mero\s+de\s+identificaci[oó]n/i,
  );

  const respuestasCorreo = obtenerRespuestas(
    turnos,
    /correo electronico|correo/i,
  );

  const respuestasTelefono = obtenerRespuestas(
    turnos,
    /n[uú]mero de contacto|n[uú]mero de tel[eé]fono|celular|tel[eé]fono fijo/i,
  );

  const respuestasPolitica = obtenerRespuestas(
    turnos,
    /acepta.{0,150}(uso|tratamiento|datos personales)|datos personales.{0,150}acepta/i,
  );

  resultado.nombre_completo = extraerNombre(
    respuestasNombre.map((item) => item.respuesta),
  );

  resultado.tipo_documento = extraerTipoDocumento(
    respuestasTipo.map((item) => item.respuesta),
  );

  resultado.numero_documento = extraerNumeroDocumento(
    respuestasDocumento.map((item) => item.respuesta),
  );

  resultado.correo_electronico = extraerCorreo(
    respuestasCorreo.map((item) => item.respuesta),
  );

  resultado.numero_telefono = extraerTelefono(
    respuestasTelefono.map((item) => item.respuesta),
  );

  resultado.acepta_politica = extraerAceptacion(respuestasPolitica);

  return resultado;
};
