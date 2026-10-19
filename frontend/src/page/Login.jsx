import { useState } from 'react';
import {
  Wallet,
  Mail,
  LockKeyhole,
  UserRound,
  Eye,
  EyeOff,
  ArrowRight,
  ReceiptText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [modo, setModo] = useState('login');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const esRegistro = modo === 'registro';

  // conexion   formulario con FastAPI .
  async function manejarEnvio(event) {
    event.preventDefault();
    setError('');
    setMensaje('');
    setCargando(true);
    try {
      if (esRegistro) {
        //api registro
        await api.post('/api/registro', {
          name: nombre.trim(),
          email: email.trim(),
          password: password,
        });

        setModo('login');
        setNombre('');
        setPassword('');
        setMensaje('¡Cuenta creada! Ahora puedes iniciar sesión.');
        return;
      }
      //inicio de sesion
      await api.post('/api/sesion', {
        email: email.trim(),
        password: password,
      });
// obtener el usuario autenticado
      const respuesta = await api.get("/api/usuario_actual");
//entrar al panel
      navigate("/dashboard", {
        replace: true,
        state: { usuario: respuesta.data },
      });
    } catch (err) {
      const detalle = err.response?.data?.detail;

      if (Array.isArray(detalle)) {
        setError(detalle.map((item) => item.msg).join('. '));
      } else if (typeof detalle === 'string') {
        setError(detalle);
      } else {
        setError(
          'No se pudo conectar con el servidor. Comprueba que FastAPI esté funcionando.'
        );
      }
    } finally {
      setCargando(false);
    }
  }

  

  return (
    <main className="flex min-h-screen bg-white">
      <section className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-emerald-700 p-12 text-white lg:flex xl:p-16">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-500/30" />
        <div className="absolute -bottom-28 -left-20 h-96 w-96 rounded-full bg-emerald-800/50" />
        <div className="relative z-10 max-w-lg"></div>
        <p className="relative z-10 text-sm text-emerald-100">
          Toma el control de los gastos
        </p>
      </section>

      <section className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="rounded-xl bg-emerald-600 p-3 text-white">
              <Wallet size={25} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">MiControl</h1>
              <p className="text-sm text-slate-500">Control de Gastos</p>
            </div>
          </div>

          <div className="mb-8">
            <p className="mb-3 text-sm font-semibold text-emerald-700">
              {esRegistro ? 'COMIENZA HOY' : ' '}
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              {esRegistro ? 'Crea tu cuenta' : 'Inicia sesión'}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {esRegistro
                ? 'Completa tus datos para comenzar a administrar tus gastos.'
                : 'Ingresa tus datos para continuar.'}
            </p>
          </div>
          {mensaje && (
            <div
              role="status"
              className="mb-5 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700"
            >
              {mensaje}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700"
            >
              {error}
            </div>
          )}
          <form onSubmit={manejarEnvio} className="space-y-5">
            {esRegistro && (
              <div>
                <label
                  htmlFor="nombre"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Nombre completo
                </label>

                <div className="relative">
                  <UserRound
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="nombre"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={100}
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Correo electrónico
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={255}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Contraseña
              </label>

              <div className="relative">
                <LockKeyhole
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="password"
                  name="password"
                  type={mostrarPassword ? 'text' : 'password'}
                  autoComplete={
                    esRegistro ? 'new-password' : 'current-password'
                  }
                  required
                  minLength={esRegistro ? 8 : 1}
                  maxLength={128}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    esRegistro ? 'Mínimo 8 caracteres' : 'Tu contraseña'
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50"
                />

                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  aria-label={
                    mostrarPassword
                      ? 'Ocultar contraseña'
                      : 'Mostrar contraseña'
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {/* boton para iniciar o crear cuenta */}
            <button
              type="submit"
              disabled={cargando}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100"
            >
              {cargando
                ? 'Procesando...'
                : esRegistro
                  ? 'Crear cuenta'
                  : 'Entrar a mi cuenta'}

              {!cargando && <ArrowRight size={19} />}
            </button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">
              MI CONTROL FINANCIERO
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <p className="text-center text-sm text-slate-600">
            {esRegistro
              ? '¿Ya tienes una cuenta?'
              : '¿Aún no tienes una cuenta?'}
            <button
              type="button"
              onClick={() => {
                setModo(esRegistro ? 'login' : 'registro');
                setNombre('');
                setEmail('');
                setPassword('');
              }}
              className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              {esRegistro ? 'Inicia sesión' : 'Regístrate gratis'}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
