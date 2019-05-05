import { IStepContextOptions } from './step.types';
import { StepSceneHandler } from '../scenes/step.types';

export default class StepSceneContext {
	private context: IStepContextOptions['context'];

	private steps: IStepContextOptions['steps'];

	private stepChanged = false;

	constructor(options: IStepContextOptions) {
		this.context = options.context;

		this.steps = options.steps;
	}

	/**
	 * The first enter to the handler
	 */
	get firstTime(): boolean {
		const { firstTime = true } = this.context.scene.session;

		return firstTime;
	}

	/**
	 * Returns current stepId
	 */
	get stepId(): number {
		return this.context.scene.session.stepId || 0;
	}

	/**
	 * Sets current stepId
	 */
	set stepId(stepId: number) {
		const { session } = this.context.scene;

		session.stepId = stepId;
		session.firstTime = true;

		this.stepChanged = true;
	}

	/**
	 * Returns current handler
	 */
	get current(): StepSceneHandler<{}> | null {
		return this.steps[this.stepId] || null;
	}

	/**
	 * Reenter current step handler
	 *
	 * @example
	 * ctx.scene.step.reenter();
	 */
	async reenter() {
		const { current } = this;

		if (!current) {
			await this.context.scene.leave();

			return;
		}

		this.stepChanged = false;

		await current(this.context);

		if (!this.stepChanged) {
			this.context.scene.session.firstTime = false;
		}
	}

	/**
	 * Move to the next handler
	 *
	 * @example
	 * ctx.scene.step.next();
	 * ctx.scene.step.next({
	 *   silent: true
	 * });
	 */
	async next({ silent = false } = {}) {
		this.stepId += 1;

		if (silent) {
			return;
		}

		await this.reenter();
	}

	/**
	 * Move to the previous handler
	 *
	 * @example
	 * ctx.scene.step.previous();
	 * ctx.scene.step.previous({
	 *   silent: true
	 * });
	 */
	async previous({ silent = false } = {}) {
		this.stepId -= 1;

		if (silent) {
			return;
		}

		await this.reenter();
	}
}
