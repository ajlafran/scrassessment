const projects = [
  { name: "Proyecto uno", text: "Una línea sobre qué hace y qué usaste." },
  { name: "Proyecto dos", text: "Una línea sobre qué hace y qué usaste." },
  { name: "Proyecto tres", text: "Una línea sobre qué hace y qué usaste." },
];

export default function Home() {
  return (
    <div className="wrap">
      <header>
        <h1>Hola, soy Tu Nombre</h1>
        <p className="lead">Breve descripción de lo que hacés y lo que te apasiona.</p>
      </header>

      <section>
        <h2>Sobre mí</h2>
        <p>Contá acá quién sos, tu experiencia y qué tipo de proyectos te interesan.</p>
      </section>

      <section>
        <h2>Proyectos</h2>
        <div className="grid">
          {projects.map((p) => (
            <div className="card" key={p.name}>
              <h3>{p.name}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Contacto</h2>
        <p>
          <a href="https://github.com/ajlafran">GitHub</a> ·{" "}
          <a href="mailto:tu@email.com">tu@email.com</a>
        </p>
      </section>

      <footer>© 2026 Tu Nombre</footer>
    </div>
  );
}
