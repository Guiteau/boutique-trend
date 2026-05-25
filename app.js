document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('copy-form');
    const submitBtn = document.getElementById('submit-btn');
    const emptyState = document.getElementById('empty-state');
    const loadingState = document.getElementById('loading-state');
    const resultsContainer = document.getElementById('results-container');

    const outputWeb = document.getElementById('output-web');
    const outputSeo = document.getElementById('output-seo');
    const outputIg = document.getElementById('output-ig');

    const fieldIds = ['prenda', 'marca', 'material', 'color', 'estilo', 'contexto'];
    const fields = fieldIds.map((id) => document.getElementById(id));

    const SEO_MAX = 155;

    // Remove invalid state as soon as the user starts typing.
    fields.forEach((field) => {
        field.addEventListener('input', () => {
            if (field.classList.contains('invalid') && field.value.trim() !== '') {
                field.classList.remove('invalid');
            }
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const values = {};
        let firstInvalid = null;

        fields.forEach((field) => {
            const value = field.value.trim();
            if (value === '') {
                field.classList.remove('invalid');
                // Force reflow so the shake animation re-triggers on repeat submits.
                void field.offsetWidth;
                field.classList.add('invalid');
                if (!firstInvalid) firstInvalid = field;
            }
            values[field.id] = value;
        });

        if (firstInvalid) {
            firstInvalid.focus({ preventScroll: false });
            return;
        }

        // UI State: Loading
        submitBtn.disabled = true;
        submitBtn.textContent = 'Generando...';
        emptyState.classList.add('hidden');
        resultsContainer.classList.add('hidden');
        loadingState.classList.remove('hidden');

        setTimeout(() => {
            const copy = generateCopy(values);

            outputWeb.textContent = copy.web;
            outputIg.textContent = copy.instagram;
            renderSeo(copy.seo);

            loadingState.classList.add('hidden');
            resultsContainer.classList.remove('hidden');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Generar Textos';
        }, 2000);
    });

    // Copy buttons — for SEO we read the raw text from a data attribute so the
    // character counter chip isn't included in the clipboard payload.
    document.querySelectorAll('.btn-copy').forEach((btn) => {
        btn.addEventListener('click', () => {
            const target = document.getElementById(btn.getAttribute('data-target'));
            if (!target) return;
            const text = target.dataset.copyText || target.textContent;

            navigator.clipboard.writeText(text).then(() => {
                const originalText = btn.textContent;
                btn.textContent = 'Copiado';
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.classList.remove('copied');
                }, 1800);
            }).catch((err) => {
                console.error('Error al copiar: ', err);
                alert('No se pudo copiar el texto. Verifica los permisos del navegador.');
            });
        });
    });

    // ----- SEO rendering with live counter -----
    function renderSeo({ title, description }) {
        const length = description.length;
        let counterClass = '';
        if (length > SEO_MAX) counterClass = 'error';
        else if (length > SEO_MAX - 15) counterClass = 'warn';

        const counterLabel = length > SEO_MAX
            ? `${length} / ${SEO_MAX} — excede el límite recomendado`
            : `${length} / ${SEO_MAX} caracteres`;

        outputSeo.innerHTML = `
            <div class="seo-block">
                <span class="seo-label">Meta Título</span>
                <p class="seo-text">${escapeHtml(title)}</p>
            </div>
            <div class="seo-block">
                <span class="seo-label">Meta Descripción</span>
                <p class="seo-text">${escapeHtml(description)}</p>
                <div class="seo-counter ${counterClass}">${counterLabel}</div>
            </div>
        `;
        outputSeo.dataset.copyText = `Meta Título:\n${title}\n\nMeta Descripción:\n${description}`;
    }

    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, (c) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
    }

    // ----- Context-aware copy generation -----
    //
    // The Contexto field is the emotional anchor of the entire piece. We
    // classify what the user wrote into one of several boutique-relevant
    // moods, and that mood reshapes the WHOLE narrative — opening hook,
    // sensory language, IG voice, and hashtags. Anything that doesn't match
    // falls back to a neutral, elegant default.
    function getContextProfile(contexto) {
        const c = contexto.toLowerCase();
        const test = (re) => re.test(c);

        if (test(/\b(verano|playa|sol|piscina|calor|costa|mar|mediterr|verbena|chiringuito)\b/)) {
            return {
                key: 'verano',
                webOpen: (p) => `Cuando el sol dora la piel y las horas se estiran, el ${p} se convierte en tu compañero indispensable.`,
                webBody: (m, col) => `Su ${m} respira con cada brisa y su tono ${col} captura la luz dorada de los atardeceres mediterráneos. Un guiño a la libertad de los días largos.`,
                webClose: (ctx) => `Pensado para vivirse en ${ctx}: con los pies en la arena, una copa en la mano y el sol como único reloj.`,
                seoHook: 'fresco para el verano',
                igEmoji: '☀️',
                igHook: 'Días largos, sombras suaves, esa luz que solo existe en verano.',
                igClose: 'Lleva el sol contigo. ✨',
                hashtags: ['#SummerEdit', '#GoldenHour', '#ResortStyle', '#SunSeeker']
            };
        }

        if (test(/\b(invierno|frio|frío|nieve|navidad|chimenea|montañ|abrigad|gélid|escarcha)\b/)) {
            return {
                key: 'invierno',
                webOpen: (p) => `Cuando el aire se vuelve cortante y la luz se hace breve, el ${p} es el refugio que se viste.`,
                webBody: (m, col) => `Su ${m} envuelve con una calidez deliberada y su tono ${col} dialoga con los grises del invierno, aportando una elegancia introspectiva.`,
                webClose: (ctx) => `Diseñado para ${ctx}: pasos cortos en aceras heladas, cafés humeantes y la silenciosa belleza del frío.`,
                seoHook: 'cálido para el invierno',
                igEmoji: '❄️',
                igHook: 'El frío entiende de capas — y esta es la que cuenta.',
                igClose: 'Abriga sin perder un gramo de elegancia. 🤍',
                hashtags: ['#WinterMood', '#CozyLuxe', '#ColdWeatherChic', '#LayeringSeason']
            };
        }

        if (test(/\b(boda|gala|evento|alfombra|gala|coctel|cóctel|c[oó]ctel|premier|fiesta de gala|fiesta especial|aniversario)\b/)) {
            return {
                key: 'gala',
                webOpen: (p) => `Hay noches que se recuerdan toda la vida. Para ellas existe este ${p}.`,
                webBody: (m, col) => `Confeccionado en ${m} con un acabado de alta costura, su ${col} esculpe la silueta bajo cualquier iluminación. Cada detalle es un susurro de sofisticación.`,
                webClose: (ctx) => `La pieza definitiva para ${ctx}: cuando entrar a una sala debe ser, en sí mismo, un acontecimiento.`,
                seoHook: 'elegante para eventos especiales',
                igEmoji: '🥂',
                igHook: 'Para esas noches en las que el aire mismo parece celebrarte.',
                igClose: 'Sé el momento que recordarán. 🤍',
                hashtags: ['#EventReady', '#StatementPiece', '#BlackTie', '#OccasionWear']
            };
        }

        if (test(/\b(oficina|trabajo|reuni[oó]n|ejecutiv|profesional|negocio|corporativ|despacho|entrevista|junta)\b/)) {
            return {
                key: 'oficina',
                webOpen: (p) => `La autoridad no se grita: se viste. Este ${p} entiende el lenguaje silencioso del poder.`,
                webBody: (m, col) => `Su ${m} mantiene la línea impecable de la mañana a la noche, y su ${col} sereno proyecta confianza sin estridencias. Tailoring que trabaja contigo.`,
                webClose: (ctx) => `Pensado para ${ctx}: reuniones que importan, decisiones que pesan y la presencia que las acompaña.`,
                seoHook: 'profesional para la oficina',
                igEmoji: '◼️',
                igHook: 'La elegancia funcional siempre llega antes que tú a la sala.',
                igClose: 'Vístete para la conversación que quieres tener. ◼️',
                hashtags: ['#WorkwearEdit', '#PowerDressing', '#OfficeStyle', '#ModernTailoring']
            };
        }

        if (test(/\b(noche|cena|cita|romant|romántic|date|after|copas|bar|nocturn|nocturn)\b/)) {
            return {
                key: 'noche',
                webOpen: (p) => `Cuando cae la luz y comienza otra historia, el ${p} sabe cómo entrar en escena.`,
                webBody: (m, col) => `Su ${m} acaricia con un movimiento estudiado y el ${col} juega con las luces tenues, sugiriendo más de lo que muestra. Sensualidad con guion.`,
                webClose: (ctx) => `Hecho para ${ctx}: las miradas largas, las pausas elocuentes y todo lo que ocurre después.`,
                seoHook: 'seductor para la noche',
                igEmoji: '🌙',
                igHook: 'La noche tiene su propio guardarropa. Este es el papel principal.',
                igClose: 'Que la velada esté a tu altura. 🌙',
                hashtags: ['#NightOut', '#DateNightLook', '#EveningStyle', '#AfterDark']
            };
        }

        if (test(/\b(primavera|floral|jardin|jardín|p[ée]talo|brote|abril|mayo|terraza|brunch)\b/)) {
            return {
                key: 'primavera',
                webOpen: (p) => `Primavera siempre llega como una promesa, y este ${p} es su mejor versión.`,
                webBody: (m, col) => `Su ${m} tiene la levedad de los días recién estrenados y el ${col} se mueve como un pétalo que aún no decide caer. Un soplo de aire nuevo.`,
                webClose: (ctx) => `Pensado para ${ctx}: brunchs sin prisa, paseos sin destino y la luz blanda del primer sol.`,
                seoHook: 'fresco para primavera',
                igEmoji: '🌸',
                igHook: 'Algo florece. Spoiler: eres tú.',
                igClose: 'Bienvenida la temporada de empezar de nuevo. 🌸',
                hashtags: ['#SpringEdit', '#InBloom', '#FreshSeason', '#SoftDressing']
            };
        }

        if (test(/\b(oto[ñn]o|otoñal|hojas|septiembre|octubre|noviembre|tierra|terracota|madera)\b/)) {
            return {
                key: 'otono',
                webOpen: (p) => `Otoño tiene una paleta que pocos saben llevar. Este ${p} sí.`,
                webBody: (m, col) => `Su ${m} aporta una calidez táctil y el ${col} dialoga con los cobrizos del paisaje. Una pieza que entiende los tonos tierra como una segunda piel.`,
                webClose: (ctx) => `Ideal para ${ctx}: paseos entre hojas, luz oblicua y conversaciones largas con buen café.`,
                seoHook: 'cálido para el otoño',
                igEmoji: '🍂',
                igHook: 'Tonos tierra, luz dorada, el otoño en su mejor versión.',
                igClose: 'La estación de los matices. 🍂',
                hashtags: ['#AutumnMood', '#EarthTones', '#FallEdit', '#LayeredLook']
            };
        }

        if (test(/\b(viaje|vacacion|escapada|aeropuerto|maleta|aventur|nomada|nómada|destino|getaway)\b/)) {
            return {
                key: 'viaje',
                webOpen: (p) => `Algunas piezas se quedan en casa. Este ${p}, no: este pertenece a la maleta.`,
                webBody: (m, col) => `Su ${m} sobrevive a horas de vuelo sin perder presencia, y el ${col} se adapta a cualquier ciudad. Una sola pieza, infinitos escenarios.`,
                webClose: (ctx) => `Diseñado para ${ctx}: cambios de huso, hoteles boutique y la sensación de pertenecer a varios lugares.`,
                seoHook: 'versátil para viajar',
                igEmoji: '✈️',
                igHook: 'La maleta sabe cuáles son las prendas que de verdad importan.',
                igClose: 'Lista para el próximo destino. ✈️',
                hashtags: ['#TravelEdit', '#CapsuleWardrobe', '#JetSetStyle', '#WanderInStyle']
            };
        }

        if (test(/\b(casual|diario|d[ií]a a d[ií]a|cotidian|relajad|finde|fin de semana|paseo)\b/)) {
            return {
                key: 'casual',
                webOpen: (p) => `Las prendas favoritas no se anuncian: simplemente vuelven una y otra vez al cuerpo. Así es este ${p}.`,
                webBody: (m, col) => `Su ${m} encuentra el equilibrio exacto entre comodidad y línea, y el ${col} combina con todo lo que ya amas en tu armario. La sofisticación de lo fácil.`,
                webClose: (ctx) => `Hecho para ${ctx}: recados sin prisa, cafés improvisados y todo lo bueno que ocurre sin agenda.`,
                seoHook: 'cómodo para el día a día',
                igEmoji: '🤍',
                igHook: 'La pieza que vas a usar más de lo que admitirás.',
                igClose: 'Elegancia para lo cotidiano. 🤍',
                hashtags: ['#EverydayEdit', '#QuietLuxury', '#EffortlessStyle', '#DailyUniform']
            };
        }

        // Fallback profile — refined neutral tone.
        return {
            key: 'default',
            webOpen: (p) => `Hay prendas que no piden permiso para destacar. Este ${p} es una de ellas.`,
            webBody: (m, col) => `Su ${m} aporta una textura distintiva y el ${col} construye una silueta que se sostiene por sí misma. Una pieza pensada con intención.`,
            webClose: (ctx) => `La elección natural para ${ctx}: cuando la ocasión merece algo que esté a su altura.`,
            seoHook: 'pensado para cada ocasión',
            igEmoji: '🤍',
            igHook: 'Una pieza que dice mucho sin levantar la voz.',
            igClose: 'Para cuando lo único que importa es estar bien vestida. 🤍',
            hashtags: ['#TimelessStyle', '#WardrobeStaple', '#ConsideredDressing', '#ModernClassic']
        };
    }

    function generateCopy({ prenda, marca, material, color, estilo, contexto }) {
        const profile = getContextProfile(contexto);
        const p = prenda.toLowerCase();
        const m = material.toLowerCase();
        const col = color.toLowerCase();
        const est = estilo.toLowerCase();
        const ctx = contexto.toLowerCase();

        // Web — long-form product page narrative driven by the context profile.
        const web = [
            profile.webOpen(p),
            `Firmado por ${marca}, llega como una declaración de su saber hacer.`,
            '',
            profile.webBody(m, col),
            `El estilo ${est} se manifiesta en cada costura: una pieza que no busca tendencias, sino quedarse.`,
            '',
            profile.webClose(ctx)
        ].join('\n');

        // SEO — title compact, description trimmed near the 155 cap and shaped
        // by the active context to keep search intent aligned with the mood.
        const title = `${prenda} ${color} en ${material} — ${marca}`;
        const baseDescription = `${capitalize(prenda)} de ${marca} en ${material} ${col}. Estilo ${est}, ${profile.seoHook}. Disfrútalo en ${contexto}.`;
        const description = baseDescription.length > 165
            ? baseDescription.slice(0, 162).trimEnd() + '…'
            : baseDescription;

        // Instagram — voice, emoji set and hashtags are 100% context-driven.
        const brandTag = `#${marca.replace(/\s+/g, '')}`;
        const styleTag = `#${estilo.replace(/\s+/g, '')}`;
        const hashtags = [brandTag, styleTag, ...profile.hashtags].join(' ');

        const instagram = [
            `${profile.igHook} ${profile.igEmoji}`,
            '',
            `El nuevo ${p} de ${marca} en ${col}, confeccionado en ${m}.`,
            `Una lectura ${est} pensada para ${ctx}.`,
            '',
            profile.igClose,
            '',
            'Descúbrelo en el link de la bio.',
            '',
            hashtags
        ].join('\n');

        return {
            web,
            seo: { title, description },
            instagram
        };
    }

    function capitalize(str) {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
});
