import {
  Wallet,
  TrendingUp,
  ReceiptText,
  Plus,
  Search,
  Bell,
  ChevronDown,
  LayoutDashboard,
  CreditCard,
  Settings,
  LogOut,
  CalendarDays,
  ArrowUpRight,
  PanelsLeftBottom,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import GastoModal from '../components/GastoModal'; //Modales actualizar y eliminar

//formatea la cantidad numerica a moneda de mexico mx
const dinero = (cantidad) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(cantidad);

// Convierte una fecha al formato legible para mostrarla en la tabla
const fechas = (fecha) =>
  new Date(`${fecha}T12:00:00`).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const categorias = [
  'Todas',
  'Papelería',
  'Transporte',
  'Alimentos',
  'Servicios',
  'Otros',
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [gastos, setGastos] = useState([]);
  const [cargandogastos, setCargandogasto] = useState(true);
  const [errocargarGastos, setErrocargarGastos] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const [mes, setMes] = useState('2026-10');
  //   estados usarios
  const [cargandousuarios, setCargandousuarios] = useState(true);
  const [usuarios, setUsuarios] = useState(null);
  // estados para controlar el modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardandoGasto, setGuardandoGasto] = useState(false);
  const [errorCrear, setErrorCrear] = useState('');
  // Estado con los campos del formulario
  const [nuevoGasto, setNuevoGasto] = useState({
    dates: new Date().toISOString().split('T')[0], // Fecha de hoy por defecto (YYYY-MM-DD)
    concept: '',
    category: 'Transporte',
    amount: '',
    payment_method: 'Efectivo',
    invoice: false,
  });
  const [gastoSeleccionado, SetGastoSeleccionado] = useState(null);

  //Carga los gastos del usuario autenticado
  useEffect(() => {
    let activo = true;
    async function Cargargastos() {
      try {
        setCargandogasto(true);
        setErrocargarGastos('');
        const respuesta = await api.get('/api/gastos');
        if (activo) {
          setGastos(respuesta.data);
        }
      } catch (error) {
        console.error('Error al cargar los gastos:', error);

        if (activo) {
          setErrorGastos(
            error.response?.status === 401
              ? 'Tu sesión expiró. Inicia sesión nuevamente.'
              : 'No se pudieron cargar los gastos. Inténtalo de nuevo.'
          );
        }
      } finally {
        if (activo) {
          setCargandogasto(false);
        }
      }
    }
    Cargargastos();
    return () => {
      activo = false;
    };
  }, []);

  // filtrar gastos por concepto,categoria y mes
  const gastosFiltrados = gastos.filter((gasto) => {
    const coincideTexto = gasto.concept
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const coincideCategoria =
      categoria === 'Todas' || gasto.category === categoria;

    const coincideMes = gasto.dates.startsWith(mes);

    return coincideTexto && coincideCategoria && coincideMes;
  });

  //calcula el monto total de los gastos filtrados
  //converte el monto a numero antes de sumarlo
  const totalGastado = gastosFiltrados.reduce(
    (total, gasto) => total + Number(gasto.amount ?? 0),
    0
  );

  const totalDeducible = gastosFiltrados
    .filter((gasto) => gasto.deducible)
    .reduce((total, gasto) => total + Number(gasto.amount, 0), 0);

  //datos usuario
  useEffect(() => {
    let activo = true;
    async function CargarUsuario() {
      try {
        setCargandousuarios(true);
        const respuesta = await api.get('/api/usuario_actual');
        if (activo && respuesta.data) {
          setUsuarios(respuesta.data);
        }
      } catch (error) {
        console.error('Error al cargar los usuarios:', error);
        //si la sesion no es valida podemos enviar al login
        if (activo && error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        if (activo) {
          setCargandousuarios(false);
        }
      }
    }
    CargarUsuario();
    return () => {
      activo = false;
    };
  }, [navigate]);

  //tarjetas para vista
  const tarjetas = [
    {
      titulo: 'Total gastado',
      valor: dinero(totalGastado),
      detalle: 'Total',
      icono: Wallet,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      titulo: 'Gastos deducibles',
      valor: dinero(totalDeducible),
      detalle: 'Unicamente gastos que si son deducibles',
      icono: TrendingUp,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      titulo: 'Número de gastos',
      valor: gastosFiltrados.length.toString(),
      detalle: 'Movimientos encontrados',
      icono: ReceiptText,
      color: 'bg-emerald-50 text-emerald-600',
    },
  ];

  //  CREAR GASTOS nuevo
  const handleCrearGasto = async (e) => {
    e.preventDefault();
    setErrorCrear('');
    // Validación de monto
    if (!nuevoGasto.amount || Number(nuevoGasto.amount) <= 0) {
      setErrorCrear('El importe debe ser mayor a 0');
      return;
    }
    try {
      setGuardandoGasto(true);
      //peticion creacion
      const respuesta = await api.post('/api/gastos', {
        ...nuevoGasto,
        amount: Number(nuevoGasto.amount),
      });
      setGastos((gastosPrevios) => [respuesta.data, ...gastosPrevios]);
      setModalAbierto(false);
      setNuevoGasto({
        dates: new Date().toISOString().split('T')[0],
        concept: '',
        category: 'Transporte',
        amount: '',
        payment_method: 'Efectivo',
        invoice: false,
      });
    } catch (error) {
      console.error('Error al crear el gasto:', error);
      setErrorCrear(
        error.response?.data?.detail ||
          'No se pudo guardar el gasto. Inténtalo de nuevo.'
      );
    } finally {
      setGuardandoGasto(false);
    }
  };

  //cerrar sesion
  const handleCerrarSesion = async () => {
    try {
      // Se envía la petición DELETE para finalizar la sesión en el backend
      await api.delete('/api/sesion');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      //limpiamos la informacion del usuario en memoria
      setUsuarios(null);
      setGastos([]);
      // Se redirige al usuario a la página de login
      navigate('/login', { replace: true });
    }
  };

  
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-6 md:flex">
          <div className="mb-10 flex items-center gap-3">
            <div className="rounded-xl bg-emerald-600 p-2.5 text-white">
              <Wallet size={23} />
            </div>
            <div>
              <h1 className="font-bold text-slate-900">Mi Control</h1>
              <p className="text-xs text-slate-500">Control de Gastos</p>
            </div>
          </div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Menú principal
          </p>

          <nav className="space-y-2">
            <a
              href="#dashboard"
              className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 font-semibold text-emerald-700"
            >
              <PanelsLeftBottom size={19} />
              Panel
            </a>

            <a
              href="#gastos"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition hover:bg-slate-100"
            >
              <CreditCard size={19} />
              Mis gastos
            </a>

            <a
              href="#resumen"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition hover:bg-slate-100"
            >
              <ReceiptText size={19} />
              Resumen mensual
            </a>
          </nav>

          <div className="mt-auto space-y-2 pt-8">
            {/* <a
              href="#configuracion"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-600 hover:bg-slate-100"
            >
              <Settings size={19} />
              Configuración
            </a> */}
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-600 hover:bg-slate-100"
              onClick={handleCerrarSesion}
            >
              <LogOut size={19} />
              Cerrar sesión
            </button>
          </div>
        </aside>

        <main id="dashboard" className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
          <header className="mb-9 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {`Mi Panel-${usuarios?.name || 'Usuario'}`}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Revisa y administra tus gastos.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5 pr-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                  {usuarios?.name ? usuarios.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold">
                    {usuarios?.name || 'Mi cuenta'}
                  </p>
                  <p className="text-xs text-slate-500">Usuario</p>
                </div>
                <ChevronDown size={16} className="text-slate-400" />
              </button>
            </div>
          </header>
          {cargandogastos && (
            <p className="mb-4 text-sm text-slate-500">Cargando Gastos...</p>
          )}
          {errocargarGastos && (
            <p
              role="alert"
              className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700"
            >
              {errocargarGastos}
            </p>
          )}
          <section className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {tarjetas.map((tarjeta) => {
              const Icono = tarjeta.icono;

              return (
                <article
                  key={tarjeta.titulo}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium text-slate-500">
                      {tarjeta.titulo}
                    </p>
                    <div className={`rounded-xl p-3 ${tarjeta.color}`}>
                      <Icono size={21} />
                    </div>
                  </div>

                  <p className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
                    {tarjeta.valor}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {tarjeta.detalle}
                  </p>
                </article>
              );
            })}
          </section>

          <section
            id="gastos"
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Movimientos recientes
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Consulta y filtra tus gastos.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalAbierto(true)}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <Plus size={18} />
                Nuevo gasto
              </button>
            </div>

            <div className="grid gap-3 border-b border-slate-100 p-6 md:grid-cols-3">
              <label className="relative block">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por concepto..."
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              <label className="relative">
                <CalendarDays
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="month"
                  value={mes}
                  onChange={(e) => setMes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                {categorias.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion === 'Todas' ? 'Todas las categorías' : opcion}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-4 font-semibold sm:px-6">
                      Concepto
                    </th>
                    <th className="px-4 py-4 font-semibold sm:px-6">Fecha</th>
                    <th className="px-4 py-4 font-semibold sm:px-6">
                      Categoría
                    </th>
                    <th className="px-4 py-4 font-semibold sm:px-6">Método</th>
                    <th className="px-4 py-4 font-semibold sm:px-6">
                      Deducible
                    </th>
                    <th className="px-4 py-4 font-semibold sm:px-6">Monto</th>
                    <th className="px-4 py-4 text-center font-semibold sm:px-6">
                      Acciones{' '}
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {gastosFiltrados.map((gasto) => (
                    <tr
                      key={gasto.id_bill}
                      onClick={() => SetGastoSeleccionado(gasto)}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="px-4 py-4 font-semibold text-slate-800 sm:px-6">
                        {gasto.concept}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-slate-500 sm:px-6">
                        {fechas(gasto.dates)}
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700">
                          {gasto.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600 sm:px-6">
                        {gasto.payment_method}
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <span
                          className={`rounded-full px-2.5 py-1.5 text-xs font-semibold ${
                            gasto.deducible
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {gasto.deducible ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        {dinero(gasto.amount)}
                      </td>
                      {/* COLUMNA DE ACCIONES CON LÁPIZ Y BASURA */}
                      <td className="px-4 py-4 text-center sm:px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setGastoAEditar(gasto)}
                            title="Editar gasto"
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setGastoAEliminar(gasto)}
                            title="Eliminar gasto"
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {gastosFiltrados.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        No se encontraron gastos con estos filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
              <p className="text-sm text-slate-500">
                {gastosFiltrados.length} movimiento(s) encontrados
              </p>
              <p className="flex items-center gap-1 text-sm font-semibold text-emerald-700">
                <ArrowUpRight size={17} />
                Resumen actualizado
              </p>
            </div>
          </section>

          <footer className="mt-8 text-center text-xs text-slate-400">
            Control de Gastos · Proyecto de administración financiera
          </footer>
        </main>
      </div>

      {gastoSeleccionado && (
        <GastoModal
          gastoAEditar={gastoSeleccionado}
          onClose={() => SetGastoSeleccionado(null)}
          onGastoActualizado={(gastoActualizado) => {
            setGastos(
              gastos.map((g) =>
                g.id_bill === gastoActualizado.id_bill ? gastoActualizado : g
              )
            );
          }}
          onGastoEliminado={(idEliminado) => {
            setGastos(gastos.filter((g) => g.id_bill !== idEliminado));
          }}
        />
      )}
      {/* MODAL PARA CREAR UN NUEVO GASTO */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Registrar nuevo gasto
              </h3>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {errorCrear && (
              <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {errorCrear}
              </p>
            )}

            <form onSubmit={handleCrearGasto} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Concepto
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Gasolina, Papel bond, Comida..."
                  value={nuevoGasto.concept}
                  onChange={(e) =>
                    setNuevoGasto({ ...nuevoGasto, concept: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Importe (\$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={nuevoGasto.amount}
                    onChange={(e) =>
                      setNuevoGasto({ ...nuevoGasto, amount: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    required
                    value={nuevoGasto.dates}
                    onChange={(e) =>
                      setNuevoGasto({ ...nuevoGasto, dates: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Categoría
                  </label>
                  <select
                    value={nuevoGasto.category}
                    onChange={(e) =>
                      setNuevoGasto({ ...nuevoGasto, category: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    {categorias
                      .filter((c) => c !== 'Todas')
                      .map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={nuevoGasto.payment_method}
                    onChange={(e) =>
                      setNuevoGasto({
                        ...nuevoGasto,
                        payment_method: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Transferencia">Transferencia</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="invoice"
                  checked={nuevoGasto.invoice}
                  onChange={(e) =>
                    setNuevoGasto({ ...nuevoGasto, invoice: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label
                  htmlFor="invoice"
                  className="text-sm font-medium text-slate-700"
                >
                  ¿Factura?
                </label>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoGasto}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {guardandoGasto ? 'Guardando...' : 'Guardar gasto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
