export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  actionA: boolean; // Usado para Acelerar
  actionB: boolean; // Usado para Aceite / Especial
}

export class TouchController {
  private state: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    actionA: false,
    actionB: false,
  };

  private canvas: HTMLCanvasElement;
  private joystickCenter: { x: number; y: number } = { x: 0, y: 0 };
  private joystickTouchId: number | null = null;
  private joystickCurrent: { x: number; y: number } = { x: 0, y: 0 };
  private joystickRadius: number = 60;

  // Posiciones de los botones A y B en la derecha
  private buttonARect = { x: 0, y: 0, radius: 45 };
  private buttonBRect = { x: 0, y: 0, radius: 45 };
  private touchAId: number | null = null;
  private touchBId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setupListeners();
    this.updateLayout();
  }

  // Actualiza las posiciones fijas según el tamaño de la pantalla del celular
  public updateLayout(): void {
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Joystick fijo en la esquina inferior izquierda
    this.joystickCenter = {
      x: 100,
      y: height - 120,
    };
    this.joystickCurrent = { ...this.joystickCenter };

    // Botones A y B fijos en la esquina inferior derecha (estilo arcade)
    this.buttonBRect = {
      x: width - 180,
      y: height - 120,
      radius: 45,
    };
    this.buttonARect = {
      x: width - 90,
      y: height - 120,
      radius: 45,
    };
  }

  private setupListeners(): void {
    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      
      // Resetear estados táctiles antes de evaluar
      let joyActive = false;
      let aActive = false;
      let bActive = false;

      const activeJoystickTouch = Array.from(e.touches).find(t => t.identifier === this.joystickTouchId);
      const activeTouchA = Array.from(e.touches).find(t => t.identifier === this.touchAId);
      const activeTouchB = Array.from(e.touches).find(t => t.identifier === this.touchBId);

      // Si levantó el dedo del joystick
      if (this.joystickTouchId !== null && !activeJoystickTouch) {
        this.joystickTouchId = null;
        this.joystickCurrent = { ...this.joystickCenter };
      }

      // Si levantó el dedo del Botón A
      if (this.touchAId !== null && !activeTouchA) {
        this.touchAId = null;
      }

      // Si levantó el dedo del Botón B
      if (this.touchBId !== null && !activeTouchB) {
        this.touchBId = null;
      }

      // Evaluar cada toque actual en la pantalla
      for (let i = 0; i < e.targetTouches.length; i++) {
        const touch = e.targetTouches[i];
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;

        // 1. Zona Izquierda: Joystick
        if (x < this.canvas.width / 2) {
          if (this.joystickTouchId === null || this.joystickTouchId === touch.identifier) {
            this.joystickTouchId = touch.identifier;
            joyActive = true;

            // Calcular desplazamiento del joystick
            const dx = x - this.joystickCenter.x;
            const dy = y - this.joystickCenter.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.joystickRadius) {
              this.joystickCurrent = { x, y };
            } else {
              this.joystickCurrent = {
                x: this.joystickCenter.x + (dx / dist) * this.joystickRadius,
                y: this.joystickCenter.y + (dy / dist) * this.joystickRadius,
              };
            }
          }
        } 
        // 2. Zona Derecha: Botones A y B
        else {
          // Evaluar Botón A (Acelerar)
          const distA = Math.hypot(x - this.buttonARect.x, y - this.buttonARect.y);
          if (distA <= this.buttonARect.radius * 1.5) { // Área amplia para comodidad
            if (this.touchAId === null || this.touchAId === touch.identifier) {
              this.touchAId = touch.identifier;
              aActive = true;
            }
          }

          // Evaluar Botón B (Aceite)
          const distB = Math.hypot(x - this.buttonBRect.x, y - this.buttonBRect.y);
          if (distB <= this.buttonBRect.radius * 1.5) {
            if (this.touchBId === null || this.touchBId === touch.identifier) {
              this.touchBId = touch.identifier;
              bActive = true;
            }
          }
        }
      }

      // Actualizar estados direccionales basados en el joystick fijo
      const moveX = this.joystickCurrent.x - this.joystickCenter.x;
      const moveY = this.joystickCurrent.y - this.joystickCenter.y;
      const deadZone = 10;

      this.state.left = joyActive && moveX < -deadZone;
      this.state.right = joyActive && moveX > deadZone;
      this.state.up = joyActive && moveY < -deadZone;
      this.state.down = joyActive && moveY > deadZone;

      this.state.actionA = aActive;
      this.state.actionB = bActive;
    };

    this.canvas.addEventListener('touchstart', handleTouch, { passive: false });
    this.canvas.addEventListener('touchmove', handleTouch, { passive: false });
    this.canvas.addEventListener('touchend', handleTouch, { passive: false });
    this.canvas.addEventListener('touchcancel', handleTouch, { passive: false });
  }

  public getState(): InputState {
    return this.state;
  }

  // Dibuja los controles en pantalla con estética de recreativa clásica
  public draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    
    // Dibujar base del Joystick (Izquierda)
    ctx.beginPath();
    ctx.arc(this.joystickCenter.x, this.joystickCenter.y, this.joystickRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();

    // Palanca del Joystick
    ctx.beginPath();
    ctx.arc(this.joystickCurrent.x, this.joystickCurrent.y, 25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 100, 100, 0.6)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    // Botón B (Aceite - Izquierdo de los dos de acción)
    ctx.beginPath();
    ctx.arc(this.buttonBRect.x, this.buttonBRect.y, this.buttonBRect.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.state.actionB ? 'rgba(50, 205, 50, 0.7)' : 'rgba(0, 150, 255, 0.3)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('B', this.buttonBRect.x, this.buttonBRect.y);

    // Botón A (Acelerar - Derecho de los dos de acción)
    ctx.beginPath();
    ctx.arc(this.buttonARect.x, this.buttonARect.y, this.buttonARect.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.state.actionA ? 'rgba(50, 205, 50, 0.7)' : 'rgba(255, 50, 50, 0.3)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillText('A', this.buttonARect.x, this.buttonARect.y);

    ctx.restore();
  }
        }
