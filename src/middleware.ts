import { lucia } from "./auth";
import { defineMiddleware } from "astro:middleware";

const protectedRoutes = ["/admin", "/api/admin"]
const redirectUrl = "/login"

export const onRequest = defineMiddleware(async (context, next) => {
	const sessionId = context.cookies.get(lucia.sessionCookieName)?.value ?? null;
	const isProtectedRoute = protectedRoutes.filter((route) => context.url.pathname.startsWith(route)).length > 0

	if (!sessionId) {
		context.locals.user = null;
		context.locals.session = null;

		if (isProtectedRoute) {
			return context.redirect(redirectUrl);
		}
		return next();
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	}

	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	}
	context.locals.session = session;
	context.locals.user = user;

	if (isProtectedRoute) {
		if (!session || !user) {
			return context.redirect(redirectUrl);
		}
	}

	return next();
});