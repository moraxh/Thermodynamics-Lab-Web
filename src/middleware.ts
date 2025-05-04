import { lucia } from "./auth";
import { defineMiddleware } from "astro:middleware";

const protectedRoutes = {
	"/admin"                   : ["GET", "POST"],
	"/api/articles"            : ["POST", "PATCH", "DELETE"],
	"/api/educational_material": ["POST", "PATCH", "DELETE"],
	"/api/events"              : ["POST", "PATCH", "DELETE"],
	"/api/gallery"             : ["POST", "PATCH", "DELETE"],
	"/api/members"             : ["POST", "PATCH", "DELETE"],
	"/api/publications"        : ["POST", "PATCH", "DELETE"],
	"/api/users"               : ["POST", "PATCH", "DELETE"],
	"/api/videos"              : ["POST", "PATCH", "DELETE"],
}
const redirectUrl = "/login"

export const onRequest = defineMiddleware(async (context, next) => {
	const sessionId = context.cookies.get(lucia.sessionCookieName)?.value ?? null;
	const isProtectedRoute = Object.keys(protectedRoutes).some((route) => {
		const isRoute = context.url.pathname.startsWith(route);
		const isMethod = protectedRoutes[route as keyof typeof protectedRoutes].includes(context.request.method);
		return isRoute && isMethod;
	})

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